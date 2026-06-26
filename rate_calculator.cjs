'use strict';

// ============================================================
// TwentyExpress Rate Calculator v3
// Rate tables built from 129 unique data points across
// 12 weight/dim combinations × 2 zones.
//
// Key insight: cost_policies = "weight" → cost indexed by actual_weight_kg
//              cost_policies = "dimension" → cost indexed by final_weight
//
// Data sources:
//   rates_all_provinces.json (1/5/10kg, 76 provinces)
//   validate_scraped.json     (0.5/2.5/3/7/15kg + 3kg big dim, 2 provinces)
//   scrape_extra_weights.json (0.5/2/3/7/15kg with standard dims, 2 provinces)
// ============================================================

const BKK_BKK_PROVINCES = new Set([
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ',
]);

function getZone(province) {
  return BKK_BKK_PROVINCES.has(province) ? 'BKK_BKK' : 'BKK_OTHER';
}

// ── Volumetric divisor per courier ───────────────────────────
const VOL_DIVISOR = {
  DPKERRY: Infinity,
  DPTHAIPOST: 1,
  DPFLASHA: 6000,
  DPSHOPEE: 5000,
  DPDHL: 5000,
  DPFLASHLIVEBULKY: Infinity,
};

// ── Rate tables ──────────────────────────────────────────────
// Each courier x zone has:
//   weight: [{kg, cost, price}, ...]  — when cost_policies="weight", indexed by actual_weight_kg
//   dim:    [{kg, cost, price}, ...]  — when cost_policies="dimension", indexed by final_weight
//
// Couriers with only weight-based pricing have no dim array.

const RATE_TABLE = {
  DPKERRY: {
    BKK_BKK: {
      weight: [
        { kg: 0.5, cost: 33, price: 45 },
        { kg: 1,   cost: 36, price: 45 },
        { kg: 2,   cost: 40, price: 50 },
        { kg: 3,   cost: 45, price: 60 },
        { kg: 4,   cost: 58, price: 70 },
        { kg: 5,   cost: 76, price: 85 },
        { kg: 6,   cost: 83, price: 95 },
        { kg: 7,   cost: 88, price: 105 },
        { kg: 8,   cost: 99, price: 120 },
        { kg: 9,   cost: 111, price: 125 },
        { kg: 10,  cost: 122, price: 135 },
        { kg: 12,  cost: 146, price: 155 },
        { kg: 15,  cost: 184, price: 195 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 0.5, cost: 33, price: 45 },
        { kg: 1,   cost: 36, price: 45 },
        { kg: 2,   cost: 47, price: 60 },
        { kg: 3,   cost: 52, price: 70 },
        { kg: 4,   cost: 63, price: 85 },
        { kg: 5,   cost: 81, price: 95 },
        { kg: 6,   cost: 88, price: 105 },
        { kg: 7,   cost: 98, price: 120 },
        { kg: 8,   cost: 108, price: 135 },
        { kg: 9,   cost: 118, price: 145 },
        { kg: 10,  cost: 131, price: 155 },
        { kg: 12,  cost: 154, price: 175 },
        { kg: 15,  cost: 193, price: 210 },
      ],
    },
  },
  DPTHAIPOST: {
    // Thai Post cost = f(actual_weight_kg). FW (volumetric grams) is display-only.
    BKK_BKK: {
      weight: [
        { kg: 0.5, cost: 30, price: 40 },
        { kg: 1,   cost: 36, price: 45 },
        { kg: 2,   cost: 44, price: 57 },
        { kg: 3,   cost: 57, price: 75 },
        { kg: 4,   cost: 66, price: 89 },
        { kg: 5,   cost: 79, price: 97 },
        { kg: 6,   cost: 96, price: 135 },
        { kg: 7,   cost: 108, price: 145 },
        { kg: 8,   cost: 120, price: 155 },
        { kg: 9,   cost: 132, price: 165 },
        { kg: 10,  cost: 147, price: 175 },
        { kg: 12,  cost: 180, price: 235 },
        { kg: 15,  cost: 220, price: 265 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 0.5, cost: 30, price: 40 },
        { kg: 1,   cost: 36, price: 45 },
        { kg: 2,   cost: 44, price: 57 },
        { kg: 3,   cost: 57, price: 75 },
        { kg: 4,   cost: 66, price: 89 },
        { kg: 5,   cost: 79, price: 97 },
        { kg: 6,   cost: 96, price: 135 },
        { kg: 7,   cost: 108, price: 145 },
        { kg: 8,   cost: 120, price: 155 },
        { kg: 9,   cost: 132, price: 165 },
        { kg: 10,  cost: 147, price: 175 },
        { kg: 12,  cost: 180, price: 235 },
        { kg: 15,  cost: 220, price: 265 },
      ],
    },
  },
  DPFLASHA: {
    // weight-based: actual weight dominates
    // dim-based: final_weight dominates (when dims are large relative to weight)
    BKK_BKK: {
      weight: [
        { kg: 0.5, cost: 28, price: 35 },
        { kg: 1,   cost: 31, price: 35 },
        { kg: 2,   cost: 35, price: 40 },
        { kg: 3,   cost: 41, price: 46 },
        { kg: 4,   cost: 57, price: 63 },
        { kg: 5,   cost: 92, price: 99 },
        { kg: 6,   cost: 80, price: 89 },
        { kg: 7,   cost: 89, price: 99 },
        { kg: 8,   cost: 103, price: 120 },
        { kg: 9,   cost: 113, price: 131 },
        { kg: 12,  cost: 160, price: 183 },
        { kg: 15,  cost: 190, price: 216 },
      ],
      dim: [
        { kg: 6,   cost: 80, price: 89 },
        { kg: 7,   cost: 89, price: 99 },
        { kg: 8,   cost: 103, price: 120 },
        { kg: 9,   cost: 113, price: 131 },
        { kg: 10,  cost: 130, price: 150 },
        { kg: 11,  cost: 150, price: 172 },
        { kg: 12,  cost: 160, price: 183 },
        { kg: 13,  cost: 170, price: 194 },
        { kg: 14,  cost: 180, price: 205 },
        { kg: 15,  cost: 190, price: 216 },
        { kg: 16,  cost: 205, price: 233 },
        { kg: 17,  cost: 215, price: 244 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 0.5, cost: 28, price: 35 },
        { kg: 1,   cost: 31, price: 35 },
        { kg: 2,   cost: 35, price: 40 },
        { kg: 3,   cost: 41, price: 46 },
        { kg: 4,   cost: 61, price: 66 },
        { kg: 5,   cost: 92, price: 99 },
        { kg: 6,   cost: 80, price: 89 },
        { kg: 7,   cost: 89, price: 99 },
        { kg: 8,   cost: 103, price: 120 },
        { kg: 9,   cost: 113, price: 131 },
        { kg: 12,  cost: 160, price: 183 },
        { kg: 15,  cost: 190, price: 216 },
      ],
      dim: [
        { kg: 6,   cost: 80, price: 89 },
        { kg: 7,   cost: 89, price: 99 },
        { kg: 8,   cost: 103, price: 120 },
        { kg: 9,   cost: 113, price: 131 },
        { kg: 10,  cost: 130, price: 150 },
        { kg: 11,  cost: 150, price: 172 },
        { kg: 12,  cost: 160, price: 183 },
        { kg: 13,  cost: 170, price: 194 },
        { kg: 14,  cost: 180, price: 205 },
        { kg: 15,  cost: 190, price: 216 },
        { kg: 16,  cost: 205, price: 233 },
        { kg: 17,  cost: 215, price: 244 },
      ],
    },
  },
  DPSHOPEE: {
    // Always weight-based pricing. Even when FW is large, cost = f(actual_weight).
    BKK_BKK: {
      weight: [
        { kg: 0.5, cost: 24, price: 30 },
        { kg: 1,   cost: 27, price: 30 },
        { kg: 2,   cost: 30, price: 38 },
        { kg: 3,   cost: 34, price: 43 },
        { kg: 4,   cost: 46, price: 58 },
        { kg: 5,   cost: 55, price: 65 },
        { kg: 6,   cost: 58, price: 73 },
        { kg: 7,   cost: 66, price: 83 },
        { kg: 8,   cost: 84, price: 102 },
        { kg: 9,   cost: 90, price: 110 },
        { kg: 10,  cost: 101, price: 120 },
        { kg: 12,  cost: 115, price: 137 },
        { kg: 15,  cost: 154, price: 168 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 0.5, cost: 35, price: 40 },
        { kg: 1,   cost: 38, price: 40 },
        { kg: 2,   cost: 39, price: 45 },
        { kg: 3,   cost: 41, price: 47 },
        { kg: 4,   cost: 46, price: 58 },
        { kg: 5,   cost: 55, price: 65 },
        { kg: 6,   cost: 58, price: 73 },
        { kg: 7,   cost: 66, price: 83 },
        { kg: 8,   cost: 81, price: 102 },
        { kg: 9,   cost: 88, price: 110 },
        { kg: 10,  cost: 99, price: 120 },
        { kg: 12,  cost: 117, price: 137 },
        { kg: 15,  cost: 143, price: 163 },
      ],
    },
  },
  DPDHL: {
    // weight-based when dims small, dim-based when dims large
    BKK_BKK: {
      weight: [
        { kg: 0.5, cost: 30, price: 35 },
        { kg: 1,   cost: 33, price: 35 },
        { kg: 2,   cost: 36, price: 41 },
        { kg: 3,   cost: 41, price: 48 },
        { kg: 4,   cost: 45, price: 58 },
        { kg: 5,   cost: 51, price: 60 },
        { kg: 6,   cost: 71, price: 76 },
        { kg: 7,   cost: 76, price: 85 },
        { kg: 8,   cost: 81, price: 92 },
        { kg: 9,   cost: 88, price: 99 },
        { kg: 12,  cost: 104, price: 119 },
        { kg: 15,  cost: 119, price: 135 },
      ],
      dim: [
        { kg: 5,   cost: 46, price: 57 },
        { kg: 7,   cost: 76, price: 85 },
        { kg: 9,   cost: 88, price: 99 },
        { kg: 12,  cost: 104, price: 119 },
        { kg: 14,  cost: 114, price: 129 },
        { kg: 15,  cost: 119, price: 135 },
        { kg: 16,  cost: 135, price: 145 },
        { kg: 17,  cost: 150, price: 162 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 0.5, cost: 30, price: 35 },
        { kg: 1,   cost: 33, price: 35 },
        { kg: 2,   cost: 44, price: 49 },
        { kg: 3,   cost: 48, price: 56 },
        { kg: 4,   cost: 52, price: 61 },
        { kg: 5,   cost: 58, price: 67 },
        { kg: 6,   cost: 88, price: 95 },
        { kg: 7,   cost: 92, price: 99 },
        { kg: 8,   cost: 97, price: 105 },
        { kg: 9,   cost: 105, price: 110 },
        { kg: 12,  cost: 129, price: 137 },
        { kg: 15,  cost: 150, price: 159 },
      ],
      dim: [
        { kg: 5,   cost: 55, price: 67 },
        { kg: 7,   cost: 92, price: 99 },
        { kg: 9,   cost: 105, price: 110 },
        { kg: 12,  cost: 129, price: 137 },
        { kg: 14,  cost: 143, price: 152 },
        { kg: 15,  cost: 150, price: 159 },
        { kg: 16,  cost: 171, price: 182 },
        { kg: 17,  cost: 176, price: 187 },
      ],
    },
  },
  DPFLASHLIVEBULKY: {
    BKK_BKK: {
      weight: [
        { kg: 6,   cost: 60, price: 60 },
        { kg: 7,   cost: 62, price: 70 },
        { kg: 8,   cost: 72, price: 80 },
        { kg: 9,   cost: 82, price: 90 },
        { kg: 10,  cost: 95, price: 100 },
        { kg: 12,  cost: 112, price: 120 },
        { kg: 15,  cost: 142, price: 150 },
      ],
      dim: [
        { kg: 10,  cost: 92, price: 100 },
        { kg: 12,  cost: 112, price: 120 },
      ],
    },
    BKK_OTHER: {
      weight: [
        { kg: 6,   cost: 60, price: 60 },
        { kg: 7,   cost: 62, price: 70 },
        { kg: 8,   cost: 72, price: 80 },
        { kg: 9,   cost: 82, price: 90 },
        { kg: 10,  cost: 95, price: 100 },
        { kg: 12,  cost: 112, price: 120 },
        { kg: 15,  cost: 142, price: 150 },
      ],
      dim: [
        { kg: 10,  cost: 92, price: 100 },
        { kg: 12,  cost: 112, price: 120 },
      ],
    },
  },
};

// ── Weight computation (with side-weight) ───────────────────

function ceilDiv(vol, divisor) {
  return Math.ceil(vol / divisor);
}

function computeVolumetricWeight(courier, volCm3) {
  const div = VOL_DIVISOR[courier];
  if (div === Infinity || !isFinite(div)) return 1;
  if (courier === 'DPTHAIPOST') return volCm3; // grams
  return ceilDiv(volCm3, div);
}

function computeChargeableWeight(courier, weightKg, wCm, lCm, hCm) {
  const volCm3 = wCm * lCm * hCm;
  if (courier === 'DPTHAIPOST') {
    return Math.max(Math.ceil(weightKg * 1000), volCm3);
  }
  const actualCeil = Math.ceil(weightKg);
  const dimWt = computeVolumetricWeight(courier, volCm3);
  return Math.max(actualCeil, dimWt);
}

/** Chargeable weight including side-weight estimate (for dim-based couriers) */
function computeChargeableWithSide(courier, weightKg, wCm, lCm, hCm) {
  const volCm3 = wCm * lCm * hCm;
  if (courier === 'DPTHAIPOST') {
    return Math.max(Math.ceil(weightKg * 1000), volCm3) / 1000;
  }
  const actualCeil = Math.ceil(weightKg);
  const dimWt = computeVolumetricWeight(courier, volCm3);
  const dimSum = wCm + lCm + hCm;
  const sideWt = estimateWeightSide(courier, dimSum);

  if (courier === 'DPDHL') {
    return Math.max(actualCeil, sideWt);
  }
  if (courier === 'DPFLASHLIVEBULKY') {
    return Math.max(actualCeil, sideWt);
  }
  return Math.max(actualCeil, dimWt, sideWt);
}

function computeVolumetricWeight(courier, volCm3) {
  const div = VOL_DIVISOR[courier];
  if (div === Infinity || !isFinite(div)) return 1;
  if (courier === 'DPTHAIPOST') return volCm3; // grams
  return ceilDiv(volCm3, div);
}

function computeChargeableWeight(courier, weightKg, wCm, lCm, hCm) {
  const volCm3 = wCm * lCm * hCm;
  if (courier === 'DPTHAIPOST') {
    return Math.max(Math.ceil(weightKg * 1000), volCm3); // grams
  }
  const actualCeil = Math.ceil(weightKg);
  const dimWt = computeVolumetricWeight(courier, volCm3);
  return Math.max(actualCeil, dimWt);
}

// ── Interpolation ────────────────────────────────────────────

function interpolate(rows, targetKg) {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => a.kg - b.kg);

  // Exact hit at endpoints
  if (targetKg === sorted[0].kg) return { cost: sorted[0].cost, price: sorted[0].price, exact: true };
  if (targetKg === sorted[sorted.length - 1].kg) return { cost: sorted[sorted.length - 1].cost, price: sorted[sorted.length - 1].price, exact: true };

  // Below minimum
  if (targetKg < sorted[0].kg) {
    if (sorted.length === 1) return { cost: sorted[0].cost, price: sorted[0].price, exact: false };
    const a = sorted[0], b = sorted[1];
    const ratio = (b.cost - a.cost) / (b.kg - a.kg);
    const cost = a.cost - ratio * (a.kg - targetKg);
    const pratio = (b.price - a.price) / (b.kg - a.kg);
    const price = a.price - pratio * (a.kg - targetKg);
    return { cost: Math.round(Math.max(0, cost) * 100) / 100, price: Math.round(Math.max(0, price) * 100) / 100, exact: false };
  }

  // Above maximum
  if (targetKg > sorted[sorted.length - 1].kg) {
    if (sorted.length === 1) return { cost: sorted[0].cost, price: sorted[0].price, exact: false };
    const a = sorted[sorted.length - 2], b = sorted[sorted.length - 1];
    const ratio = (b.cost - a.cost) / (b.kg - a.kg);
    const cost = b.cost + ratio * (targetKg - b.kg);
    const pratio = (b.price - a.price) / (b.kg - a.kg);
    const price = b.price + pratio * (targetKg - b.kg);
    return { cost: Math.round(cost * 100) / 100, price: Math.round(price * 100) / 100, exact: false };
  }

  // Within range: linear interpolation
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (targetKg >= a.kg && targetKg <= b.kg) {
      if (targetKg === a.kg) return { cost: a.cost, price: a.price, exact: true };
      if (targetKg === b.kg) return { cost: b.cost, price: b.price, exact: true };
      const frac = (targetKg - a.kg) / (b.kg - a.kg);
      return {
        cost: Math.round((a.cost + (b.cost - a.cost) * frac) * 100) / 100,
        price: Math.round((a.price + (b.price - a.price) * frac) * 100) / 100,
        exact: false,
      };
    }
  }
  return null;
}

// ── Determine which rate card is used ────────────────────────

/**
 * Predict whether cost_policies will be "weight" or "dimension".
 * Flash and DHL switch to dimension pricing when the dimensional/chargeable
 * weight clearly exceeds the actual weight.
 *
 * Weight_side heuristic (FW = max(actual, dim, side)):
 *   Flash side-wt: dimSum 90-99→7, 100-119→10, 120-134→13, 135+→16
 *   DHL side-wt:   dimSum 100-119→9, 120-134→12, 135+→16
 * Both are approximate — actual formula may differ.
 */
function estimateWeightSide(courier, dimSum) {
  if (courier === 'DPFLASHA') {
    if (dimSum >= 135.5) return 17;
    if (dimSum >= 131.5) return 16;
    if (dimSum >= 125.5) return 15;
    if (dimSum >= 121.5) return 14;
    if (dimSum >= 115.5) return 13;
    if (dimSum >= 112)   return 12;
    if (dimSum >= 105.5) return 11;
    if (dimSum >= 100.5) return 10;
    if (dimSum >= 95.5)  return 9;
    if (dimSum >= 90.5)  return 8;
    if (dimSum >= 85.5)  return 7;
    if (dimSum >= 81.5)  return 6;
    return 1;
  }
  if (courier === 'DPDHL') {
    if (dimSum >= 135.5) return 17;
    if (dimSum >= 131.5) return 16;
    if (dimSum >= 125.5) return 15;
    if (dimSum >= 121.5) return 14;
    if (dimSum >= 111.5) return 12;
    if (dimSum >= 100.5) return 9;
    if (dimSum >= 90.5)  return 7;
    if (dimSum >= 81.5)  return 5;
    return 1;
  }
  if (courier === 'DPFLASHLIVEBULKY') {
    if (dimSum >= 120) return Math.max(10, estimateWeightSide('DPFLASHA', dimSum) - 3);
    return 0;
  }
  return 1;
}

function predictPolicy(courier, weightKg, chargeableWeight, wCm, lCm, hCm) {
  if (['DPKERRY', 'DPTHAIPOST', 'DPSHOPEE'].includes(courier)) {
    return 'weight';
  }

  const volCm3 = wCm * lCm * hCm;
  const dimSum = wCm + lCm + hCm;
  const actualCeil = Math.ceil(weightKg);

  let estFW;
  if (courier === 'DPFLASHLIVEBULKY') {
    // FlashBulky uses max(actualCeil, sideWt)
    const sideWt = estimateWeightSide('DPFLASHLIVEBULKY', dimSum);
    estFW = Math.max(actualCeil, sideWt);
    return estFW > actualCeil ? 'dimension' : 'weight';
  }
  if (courier === 'DPFLASHA') {
    const dimWt = Math.ceil(volCm3 / 6000);
    const sideWt = estimateWeightSide(courier, dimSum);
    estFW = Math.max(actualCeil, dimWt, sideWt);
  } else { // DPDHL
    // DHL FW = max(actualCeil, sideWt) — no volumetric component
    const sideWt = estimateWeightSide(courier, dimSum);
    estFW = Math.max(actualCeil, sideWt);
    return estFW > actualCeil ? 'dimension' : 'weight';
  }

  return estFW > actualCeil ? 'dimension' : 'weight';
}

// ── Public API ───────────────────────────────────────────────

function calculatePrice(opts) {
  const { courier, province, weightKg, extraProfit = 0 } = opts;
  const rawW = opts.widthCm, rawL = opts.lengthCm, rawH = opts.heightCm;
  // Normalize dims to .5 increments (ceil) for side-weight table accuracy
  const w = Math.ceil(rawW * 2) / 2;
  const l = Math.ceil(rawL * 2) / 2;
  const h = Math.ceil(rawH * 2) / 2;

  // Thai Post rejects packages with volumetric weight > 60,000 cm³
  if (courier === 'DPTHAIPOST') {
    const volCm3 = w * l * h;
    if (volCm3 > 60000) {
      return {
        price: null,
        rejected: true,
        reason: 'ขนาดเกินกำหนดไปรษณีย์ไทย (ปริมาตร > 60,000 cm³)',
        _internal: { courier, province, vol_cm3: volCm3, dim_raw: { w: rawW, l: rawL, h: rawH }, dim_norm: { w, l, h } },
      };
    }
  }

  const zone = getZone(province);
  const ct = RATE_TABLE[courier];
  if (!ct) throw new Error('Unknown courier: ' + courier);
  const zoneTable = ct[zone];
  if (!zoneTable) throw new Error('No rate data for ' + courier + ' in zone ' + zone);

  const chargeableWeight = computeChargeableWeight(courier, weightKg, w, l, h);
  const chargeableWeightKg = courier === 'DPTHAIPOST' ? chargeableWeight / 1000 : chargeableWeight;

  const policy = predictPolicy(courier, weightKg, chargeableWeight, w, l, h);

  let rateRows, lookupKey;
  if (policy === 'weight' || !zoneTable.dim) {
    rateRows = zoneTable.weight;
    lookupKey = weightKg <= 0.5 ? weightKg : Math.ceil(weightKg);
  } else {
    rateRows = zoneTable.dim;
    const estFW = computeChargeableWithSide(courier, weightKg, w, l, h);
    lookupKey = estFW;
  }

  if (!rateRows) throw new Error('No rate table for policy=' + policy);

  const lookup = interpolate(rateRows, lookupKey);
  if (!lookup) throw new Error('Could not determine rate');

  const gasFee = 3;
  const basePrice = lookup.price;
  const finalPrice = basePrice + extraProfit;

  return {
    price: finalPrice,
    _internal: {
      courier, province, zone,
      weight_kg_actual: weightKg,
      dim_raw: { w: rawW, l: rawL, h: rawH },
      dim_norm: { w, l, h },
      vol_cm3: w * l * h,
      chargeable_weight_kg: chargeableWeightKg,
      chargeable_weight_raw: chargeableWeight,
      cost_policies_predicted: policy,
      lookup_key: lookupKey,
      cost: lookup.cost,
      gas_fee: gasFee,
      platform_markup: basePrice - lookup.cost,
      extra_profit: extraProfit,
      base_price: basePrice,
      final_price: finalPrice,
      interpolated: !lookup.exact,
    },
  };
}

function compareAllCouriers(opts) {
  return Object.keys(RATE_TABLE)
    .map(c => ({ courier: c, ...calculatePrice({ ...opts, courier: c }) }))
    .sort((a, b) => a.price - b.price);
}

// ── Dim normalization ─────────────────────────────────────────
function normalizeDim(cm) {
  return Math.ceil(cm * 2) / 2;
}

module.exports = { calculatePrice, compareAllCouriers, getZone, computeChargeableWeight, normalizeDim };

// ── CLI self-test ────────────────────────────────────────────
if (require.main === module) {
  const r = calculatePrice({ courier: 'DPKERRY', province: 'เชียงใหม่', weightKg: 1.3, widthCm: 21, lengthCm: 30, heightCm: 21 });
  console.log('Kerry → เชียงใหม่ 1.3kg 21×30×21: ' + r.price + ' บาท (interpolated:' + r._internal.interpolated + ')');
  console.log('\nAll couriers:');
  compareAllCouriers({ province: 'เชียงใหม่', weightKg: 1.3, widthCm: 21, lengthCm: 30, heightCm: 21 })
    .forEach(x => console.log('  ' + x.courier.padEnd(18) + String(x.price).padStart(7) + ' บาท ' + (x._internal.interpolated ? '(I)' : '(E)')));
}
