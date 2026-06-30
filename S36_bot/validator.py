"""
Thai address validator.

Validates whether a combination of subdistrict (ตำบล) / district (อำเภอ) /
province (จังหวัด) / postal code (รหัสไปรษณีย์) actually exists and is
internally consistent (i.e. the subdistrict really belongs to that district,
which really belongs to that province, with that postal code).

Data source: thailand-geography-data/thailand-geography-json (MIT licensed,
community-maintained, derived from Thailand Post / DOPA data). The dataset
is baked into the Docker image at build time, so no network access is
required at runtime.
"""

import json
import re
import unicodedata
from pathlib import Path
from typing import Optional, TypedDict

DATA_PATH = Path(__file__).parent / "geo_data" / "geography.json"

# Thai prefixes people commonly type. Stripped before comparison so that
# "อำเภอเมือง", "อ.เมือง" and "เมือง" all normalize to the same string.
_PREFIX_PATTERNS = [
    (r"^ตำบล", ""), (r"^ต\.", ""),
    (r"^แขวง", ""),  # Bangkok uses แขวง instead of ตำบล
    (r"^อำเภอ", ""), (r"^อ\.", ""),
    (r"^เขต", ""),   # Bangkok uses เขต instead of อำเภอ
    (r"^จังหวัด", ""), (r"^จ\.", ""),
]


def _normalize(name: Optional[str]) -> Optional[str]:
    """Lowercase, strip whitespace/prefixes, normalize unicode so that
    'Bangkok', ' bangkok ', 'จังหวัดกรุงเทพมหานคร' all compare equal
    to their canonical form."""
    if name is None:
        return None
    name = unicodedata.normalize("NFC", name).strip()
    for pattern, repl in _PREFIX_PATTERNS:
        name = re.sub(pattern, repl, name)
    return name.strip().lower()


class Record(TypedDict):
    provinceNameTh: str
    provinceNameEn: str
    districtNameTh: str
    districtNameEn: str
    subdistrictNameTh: str
    subdistrictNameEn: str
    postalCode: int


class ThaiAddressDB:
    """Loads the dataset once and builds normalized indexes for fast lookup."""

    def __init__(self, data_path: Path = DATA_PATH):
        with open(data_path, encoding="utf-8") as f:
            self.records: list[Record] = json.load(f)

        # Precompute normalized fields for every record so validation is O(1)
        # set/dict lookups instead of re-normalizing 7000+ rows per call.
        self._enriched = []
        for r in self.records:
            self._enriched.append({
                **r,
                "_province_norm": {_normalize(r["provinceNameTh"]), _normalize(r["provinceNameEn"])},
                "_district_norm": {_normalize(r["districtNameTh"]), _normalize(r["districtNameEn"])},
                "_subdistrict_norm": {_normalize(r["subdistrictNameTh"]), _normalize(r["subdistrictNameEn"])},
            })

        self.provinces_th = sorted({r["provinceNameTh"] for r in self.records})
        self.provinces_en = sorted({r["provinceNameEn"] for r in self.records})

        self._capital_district_norm: dict[str, str] = {}
        for r in self.records:
            if r["districtNameTh"] == f"เมือง{r['provinceNameTh']}":
                dist_norm = _normalize(r["districtNameTh"])
                for p_norm in (_normalize(r["provinceNameTh"]), _normalize(r["provinceNameEn"])):
                    self._capital_district_norm[p_norm] = dist_norm

    def _field_exists_anywhere(
        self, sub_n, dist_n, prov_n, postal_n
    ) -> dict:
        """Check each supplied field independently against the whole
        dataset (not filtered by the other fields). This tells us whether
        a field is simply unknown/misspelled, vs. known but mismatched
        with the other fields."""
        found = {
            "subdistrict": sub_n is None,
            "district": dist_n is None,
            "province": prov_n is None,
            "postal_code": postal_n is None,
        }
        for r in self._enriched:
            if not found["subdistrict"] and sub_n in r["_subdistrict_norm"]:
                found["subdistrict"] = True
            if not found["district"] and dist_n in r["_district_norm"]:
                found["district"] = True
            if not found["province"] and prov_n in r["_province_norm"]:
                found["province"] = True
            if not found["postal_code"] and str(r["postalCode"]) == postal_n:
                found["postal_code"] = True
            if all(found.values()):
                break
        return found

    def _candidates(
        self,
        subdistrict: Optional[str] = None,
        district: Optional[str] = None,
        province: Optional[str] = None,
        postal_code: Optional[str] = None,
    ) -> tuple[list[dict], dict]:
        """Filter records by whichever fields were supplied (combined, all
        must match on the same record). Returns the matching records plus
        a per-field flag of whether *that field alone* exists anywhere in
        the dataset (used to build a helpful error message)."""
        sub_n = _normalize(subdistrict)
        dist_n = _normalize(district)
        prov_n = _normalize(province)
        postal_n = postal_code.strip() if postal_code else None

        if dist_n in {"เมือง", "mueang", "muang"} and prov_n is not None:
            canonical = self._capital_district_norm.get(prov_n)
            if canonical is not None:
                dist_n = canonical

        field_found = self._field_exists_anywhere(sub_n, dist_n, prov_n, postal_n)

        candidates = []
        for r in self._enriched:
            if sub_n is not None and sub_n not in r["_subdistrict_norm"]:
                continue
            if dist_n is not None and dist_n not in r["_district_norm"]:
                continue
            if prov_n is not None and prov_n not in r["_province_norm"]:
                continue
            if postal_n is not None and str(r["postalCode"]) != postal_n:
                continue
            candidates.append(r)

        return candidates, field_found

    def validate(
        self,
        subdistrict: Optional[str] = None,
        district: Optional[str] = None,
        province: Optional[str] = None,
        postal_code: Optional[str] = None,
    ) -> dict:
        """
        Validate a Thai address combination. At least one field must be given.

        Returns a dict:
          valid: bool
          message: human-readable explanation (Thai)
          matched: the canonical record if there's exactly one match, else None
          matches: list of canonical records if there are several (ambiguous
                    input, e.g. only postal_code given and it spans many
                    subdistricts)
          field_errors: which of the supplied fields couldn't be found in
                    the dataset at all (helps distinguish "typo in district
                    name" from "district exists but doesn't belong to this
                    province")
        """
        if not any([subdistrict, district, province, postal_code]):
            return {
                "valid": False,
                "message": "ต้องระบุอย่างน้อย 1 ฟิลด์ (ตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์)",
                "matched": None,
                "matches": [],
                "field_errors": {},
            }

        candidates, field_found = self._candidates(subdistrict, district, province, postal_code)
        field_errors = {k: (not v) for k, v in field_found.items()}

        if candidates:
            simplified = [self._simplify(c) for c in candidates]
            # dedupe identical (subdistrict, district, province, postal) tuples
            unique = list({tuple(sorted(s.items())): s for s in simplified}.values())

            if len(unique) == 1:
                return {
                    "valid": True,
                    "message": "ข้อมูลถูกต้องและมีอยู่จริง",
                    "matched": unique[0],
                    "matches": [],
                    "field_errors": {},
                }
            else:
                return {
                    "valid": True,
                    "message": (
                        f"พบ {len(unique)} รายการที่ตรงกับเงื่อนไขที่ระบุ "
                        "(ข้อมูลที่ให้มายังไม่เจาะจงพอ เช่น ระบุแค่รหัสไปรษณีย์ "
                        "ที่ครอบคลุมหลายตำบล) — กรุณาดู `matches` เพื่อเลือกที่ตรงที่สุด"
                    ),
                    "matched": None,
                    "matches": unique[:50],  # cap to avoid huge payloads
                    "field_errors": {},
                }

        # No candidates matched all filters together. Figure out *why*:
        # was a field simply not found anywhere, or did the fields not
        # belong together (e.g. a real district in the wrong province)?
        unknown_fields = [k for k, v in field_errors.items() if v]
        if unknown_fields:
            label_map = {
                "subdistrict": "ตำบล/แขวง", "district": "อำเภอ/เขต",
                "province": "จังหวัด", "postal_code": "รหัสไปรษณีย์",
            }
            bad = ", ".join(label_map[f] for f in unknown_fields)
            return {
                "valid": False,
                "message": f"ไม่พบข้อมูลนี้ในระบบ: {bad} (สะกดผิด หรือไม่มีอยู่จริง)",
                "matched": None,
                "matches": [],
                "field_errors": field_errors,
            }

        return {
            "valid": False,
            "message": (
                "แต่ละฟิลด์ที่ระบุมีอยู่จริงในระบบ แต่ไม่ได้อยู่ในที่อยู่เดียวกัน "
                "(เช่น ตำบลนี้ไม่ได้อยู่ในอำเภอ/จังหวัด/รหัสไปรษณีย์ที่ระบุ)"
            ),
            "matched": None,
            "matches": [],
            "field_errors": field_errors,
        }

    @staticmethod
    def _simplify(r: dict) -> dict:
        return {
            "subdistrict_th": r["subdistrictNameTh"],
            "subdistrict_en": r["subdistrictNameEn"],
            "district_th": r["districtNameTh"],
            "district_en": r["districtNameEn"],
            "province_th": r["provinceNameTh"],
            "province_en": r["provinceNameEn"],
            "postal_code": str(r["postalCode"]),
        }


# Module-level singleton so the dataset is parsed once per process,
# not once per request.
_db: Optional[ThaiAddressDB] = None


def get_db() -> ThaiAddressDB:
    global _db
    if _db is None:
        _db = ThaiAddressDB()
    return _db


def validate_thai_address(
    subdistrict: Optional[str] = None,
    district: Optional[str] = None,
    province: Optional[str] = None,
    postal_code: Optional[str] = None,
) -> dict:
    """Public entrypoint — this is the function to expose as an AI tool."""
    return get_db().validate(subdistrict, district, province, postal_code)
