var checker_path = window.location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
var spin = checker_path != 'price-table' ? true : false;
var app = window.APP_NAME;

window.comparePrice = function () {
  if ($('#weight').val() == '' || $('#weight').val() == 0) {
    showError('กรุณากรอกน้ำหนัก', 'ข้อมูลพัสดุ');
    return false;
  }

  if ($('#width').val() == '' || $('#width').val() == 0) {
    showError('กรุณากรอกความกว้าง', 'ข้อมูลพัสดุ');
    return false;
  }

  if ($('#length').val() == '' || $('#length').val() == 0) {
    showError('กรุณากรอกความยาว', 'ข้อมูลพัสดุ');
    return false;
  }

  if ($('#height').val() == '' || $('#height').val() == 0) {
    showError('กรุณากรอกความสูง', 'ข้อมูลพัสดุ');
    return false;
  }

  if ($('#dst_sub_district').val() == '' || $('#widht').val() == 0) {
    showError('กรุณากรอกตำบลผู้รับ', 'ข้อมูลผู้รับ');
    return false;
  }

  if ($('#dst_district').val() == '' || $('#widht').val() == 0) {
    showError('กรุณากรอกอำเภอผู้รับ', 'ข้อมูลผู้รับ');
    return false;
  }

  if ($('#dst_provicne').val() == '' || $('#widht').val() == 0) {
    showError('กรุณากรอกจังหวัดผู้รับ', 'ข้อมูลผู้รับ');
    return false;
  }

  if ($('#dst_zipcode').val() == '' || $('#widht').val() == 0) {
    showError('กรุณากรอกรหัสไปรษณีย์ผู้รับ', 'ข้อมูลผู้รับ');
    return false;
  }

  $('#cover-spin').show(0);

  switch (checker_path) {
    case 'price-table':
      formData = $('#addressForm').serialize();
      break;

    case 'order/edit':
    case 'order/create':
      formData = $('#createOrderForm').serialize();
      break;

    case 'order/create-order':
      var formDataArray = $('#createOrderForm').serializeArray();
      formDataArray.push({
        name: "_token",
        value: '{{ csrf_token() }}'
      });
      formData = $.param(formDataArray);
      break;
  }

  $('.body-price').empty();
  $.get("/order/compare-price", formData).done(function (res) {
    if (res.length > 0) {
      $('#cover-spin').hide(0);
      var content = '';
      var ct = '';
      var courier_name = '';
      var logo = '';
      var recomend = '';
      var recomend_text = '';
      res.map(function (item, index) {
        if (app == 'SuperShip') {
          //flash 
          if (item.courier_code == 'FlashLive') {
            courier_name = 'Flash Express'; // logo = '../../../express/flash-express-live.png'

            logo = '../../../express/flash-express-mobile.png';
          }

          if (item.courier_code == 'FlashExpressA') {
            courier_name = 'Flash Pro A'; // logo = '../../../express/flash-express-a.png'

            logo = '../../../express/flash-express-a-mobile.png';
          } //flash fruit


          if (item.courier_code == 'SPSXFLASHFRUIT' || item.courier_code == 'DPFLASHAFRUIT' || item.courier_code == 'DPFLASHQFRUIT' || item.courier_code == 'DPFLASHLIVEFRUIT') {
            courier_name = 'Flash Fruit'; // logo = '../../../express/flash-express-fruit.png'

            logo = '../../../express/flash-express-fruit-mobile.png';
          } //flash 


          if (item.courier_code == 'FlashExpress' || item.courier_code == 'SPSXFLASH' || item.courier_code == 'SPSXFLASHS' || item.courier_code == 'FlashExpressD' || item.courier_code == 'FlashExpressS' || item.courier_code == 'SPSXFLASHY' || item.courier_code == 'DPFLASH' || item.courier_code == 'DPFLASHA' || item.courier_code == 'DPFLASHAS' || item.courier_code == 'DPFLASHQ' || item.courier_code == 'DPFLASHLIVE' || item.courier_code == 'FlashDplus' || item.courier_code == 'FlashExpressY') {
            courier_name = 'Flash Pro B'; // logo = '../../../express/flash-express.png'

            logo = '../../../express/flash-express-mobile.png';
          } //flash 


          if (item.courier_code == 'FlashExpressC' || item.courier_code == 'SPSXFLASHBULKY' || item.courier_code == 'FlashBulky' || item.courier_code == 'DPFLASHABULKY' || item.courier_code == 'DPFLASHQBULKY' || item.courier_code == 'DPFLASHLIVEBULKYX' || item.courier_code == 'DPFLASHABULKYX' || item.courier_code == 'DPFLASHLIVEBULKY') {
            courier_name = 'Flash Bulky'; // logo = '../../../express/flash-express-bulky.png'

            logo = '../../../express/flash-express-mobile.png';
          }

          if (item.courier_code == 'DHL' || item.courier_code == 'ISPDHL' || item.courier_code == 'DPDHL') {
            courier_name = 'DHL'; // logo = '../../../express/dhl-express.png'

            logo = '../../../express/dhl-mobile.png';
          }

          if (item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT') {
            courier_name = 'J&T Express'; // logo = '../../../express/jnt-express.png'

            logo = '../../../express/jnt-express-mobile.png';
          }

          if (item.courier_code == 'NinjaVan' || item.courier_code == 'DPNINJA') {
            courier_name = 'NinjaVan'; // logo = '../../../express/ninjavan.png'

            logo = '../../../express/ninjavan-mobile.png';
          }

          if (item.courier_code == 'ShopeeExpress' || item.courier_code == 'ISPSPX' || item.courier_code == 'DPSHOPEE') {
            courier_name = 'ShopeeExpress'; // logo = '../../../express/spx.png'

            logo = '../../../express/spx-mobile.jpg';
          }

          if (item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST' || item.courier_code == 'ISPTHP' || item.courier_code == 'THP_eParcelX' || item.courier_code == 'ISPTHPX') {
            courier_name = 'ไปรษณีย์ไทย (EMS)'; // logo = '../../../express/THP-eParcel.png'

            logo = '../../../express/THP-eParcel-mobile.png';
          }

          if (item.courier_code == 'KerryExpress' || item.courier_code == 'DPKERRY' || item.courier_code == 'DPKERRYQ' || item.courier_code == 'DPKERRYS' || item.courier_code == 'ISPKEX') {
            courier_name = 'Kerry Express'; // logo = '../../../express/kerry-express.png'

            logo = '../../../express/kerry-express-mobile.png';
          }

          if (item.courier_code == 'DPBESTEXPRESS') {
            courier_name = 'Best Express'; // logo = '../../../express/best-express.png'

            logo = '../../../express/best-express-mobile.png';
          }
        } else {
          if (item.courier_code == 'FlashLive') {
            courier_name = 'Flash Express'; // logo = '../../../express/flash-express-live.png'

            logo = '../../../express/flash-express-live-mobile.png';
          }

          if (item.courier_code == 'FlashExpressA') {
            courier_name = 'Flash Pro A'; // logo = '../../../express/flash-express-a.png'

            logo = '../../../express/flash-express-a-mobile.png';
          }

          if (item.courier_code == 'SPSXFLASHFRUIT' || item.courier_code == 'DPFLASHAFRUIT' || item.courier_code == 'DPFLASHQFRUIT' || item.courier_code == 'DPFLASHLIVEFRUIT') {
            courier_name = 'Flash Fruit'; // logo = '../../../express/flash-express-fruit.png'

            logo = '../../../express/flash-express-fruit-mobile.png';
          } //flash 


          if (item.courier_code == 'FlashExpress' || item.courier_code == 'SPSXFLASH' || item.courier_code == 'SPSXFLASHBULKY' || item.courier_code == 'SPSXFLASHS' || item.courier_code == 'FlashExpressD' || item.courier_code == 'FlashExpressS' || item.courier_code == 'SPSXFLASHY' || item.courier_code == 'DPFLASH' || item.courier_code == 'DPFLASHA' || item.courier_code == 'DPFLASHAS' || item.courier_code == 'DPFLASHQ' || item.courier_code == 'DPFLASHLIVE' || item.courier_code == 'FlashDplus' || item.courier_code == 'FlashExpressY') {
            courier_name = 'Flash Pro B'; // logo = '../../../express/flash-express.png'

            logo = '../../../express/flash-express-mobile.png';
          }

          if (item.courier_code == 'FlashExpressC' || item.courier_code == 'FlashBulky' || item.courier_code == 'DPFLASHABULKY' || item.courier_code == 'DPFLASHQBULKY' || item.courier_code == 'DPFLASHQBULKY' || item.courier_code == 'DPFLASHABULKYX' || item.courier_code == 'DPFLASHLIVEBULKY' || item.courier_code == 'DPFLASHLIVEBULKYX') {
            courier_name = 'Flash Bulky'; // logo = '../../../express/flash-express-bulky.png'

            logo = '../../../express/flash-express-bulky-mobile.png';
          }

          if (item.courier_code == 'DHL' || item.courier_code == 'ISPDHL' || item.courier_code == 'DPDHL') {
            courier_name = 'DHL'; // logo = '../../../express/dhl-express.png'

            logo = '../../../express/dhl-mobile.png';
          }

          if (item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT') {
            courier_name = 'J&T Express'; // logo = '../../../express/jnt-express.png'

            logo = '../../../express/jnt-express-mobile.png';
          }

          if (item.courier_code == 'NinjaVan' || item.courier_code == 'DPNINJA') {
            courier_name = 'NinjaVan'; // logo = '../../../express/ninjavan.png'

            logo = '../../../express/ninjavan-mobile.png';
          }

          if (item.courier_code == 'ShopeeExpress' || item.courier_code == 'ISPSPX' || item.courier_code == 'DPSHOPEE') {
            courier_name = 'ShopeeExpress'; // logo = '../../../express/spx.png'

            logo = '../../../express/spx-mobile.jpg';
          }

          if (item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST' || item.courier_code == 'ISPTHP' || item.courier_code == 'THP_eParcelX' || item.courier_code == 'ISPTHPX') {
            courier_name = 'ไปรษณีย์ไทย (EMS)'; // logo = '../../../express/THP-eParcel.png'

            logo = '../../../express/THP-eParcel-mobile.png';
          }

          if (item.courier_code == 'KerryExpress' || item.courier_code == 'DPKERRY' || item.courier_code == 'DPKERRYQ' || item.courier_code == 'DPKERRYS' || item.courier_code == 'ISPKEX') {
            courier_name = 'Kerry Express'; // logo = '../../../express/kerry-express.png'

            logo = '../../../express/kerry-express-mobile.png';
          }

          if (item.courier_code == 'DPBESTEXPRESS') {
            courier_name = 'Best Express'; // logo = '../../../express/best-express.png'

            logo = '../../../express/best-express-mobile.png';
          }
        }

        if (index == 0) {
          recomend = 'border-red';
          recomend_text = "<div class=\\"recomend-text\\"><span style=\\"color:white\\">\\u0E16\\u0E39\\u0E01\\u0E17\\u0E35\\u0E48\\u0E2A\\u0E38\\u0E14</span></div>";
        } else {
          recomend = '';
          recomend_text = '';
        } //add condition check pages


        if (checker_path == 'order/edit') {
          total_price = parseFloat(item.cost) + parseFloat(item.price_remote);
          check_weight_text_use = parseFloat(item.cost_weight) + parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger';
          check_dimension_text_use = 0;
        } else {
          customer_price = parseFloat(item.customer_price) > 0 ? item.customer_price : item.price;
          customer_price = parseFloat(customer_price) + parseFloat(item.price_remote);
          total_price = parseFloat(item.cost) + parseFloat(item.price_remote);
          check_weight_text_use = parseFloat(item.cost_weight) + parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger';
          check_dimension_text_use = 0;
        }

        check_dimension_text_use = parseFloat(item.cost_dimension_percent) + parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger';

        if (item.price_policies == 'dimension') {
          check_dimension_text_use = 'text-success';
        }

        if (item.cost_weight == item.cost_dimension_percent) {
          check_weight_text_use = 'text-danger';
          check_dimension_text_use = 'text-success';
        }

        if (item.cost_weight == item.cost_dimension) {
          check_weight_text_use = 'text-danger';
          check_dimension_text_use = 'text-success';
        }

        if (item.price_policies == 'dimension' && item.dimension_percent != 0) {
          check_weight_text_use = 'text-success';
          check_dimension_text_use = 'text-success';
        }

        if (item.message) {
          ct = "<div class=\\"card ".concat(recomend, "\\">\
                                        <div class=\\"card-body\\" style=\\"background:#F2F3F4\\">\
                                            ").concat(recomend_text, "\
                                            <div class=\\"row align-items-center\\">\
                                                <div class=\\"col-12 col-md-4\\">\
                                                    <div class=\\"d-flex mobile-style\\">\
                                                        <img src=\\"").concat(logo, "\\" style=\\"width: 46%; height: auto;\\" id=\\"courier-logo\\" />\
                                                    </div>\
                                                </div>\
                                                <div class=\\"col-12 col-md-8\\">\
                                                    <div class=\\"text-center\\">\
                                                        <span>").concat(item.message, "</span><br>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>");
        } else {
          ct = "<div class=\\"card ".concat(recomend, "\\">\
                                    <div class=\\"card-body\\">\
                                        ").concat(recomend_text, "\
                                        <div class=\\"row align-items-center table-responsive\\">\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"d-flex mobile-style\\">\
                                                    <img src=\\"").concat(logo, "\\" style=\\"width: 100%; height: auto;\\" id=\\"courier-logo\\" />\
                                                </div>\
                                            </div>\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"text-center\\">\
                                                    <span class=\\"text-secondary\\">\\u0E04\\u0E48\\u0E32\\u0E02\\u0E19\\u0E2A\\u0E48\\u0E07(\\u0E19\\u0E49\\u0E33\\u0E2B\\u0E19\\u0E31\\u0E01)</span><br>\
                                                    <strong class=\\"").concat(check_weight_text_use, "\\" style=\\"font-size:16px;\\"> ").concat(numberWithCommas(item.cost_weight), "</strong>\
                                                </div>\
                                            </div>\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"text-center\\">\
                                                    <span class=\\"text-secondary\\">\\u0E04\\u0E48\\u0E32\\u0E02\\u0E19\\u0E2A\\u0E48\\u0E07(\\u0E1B\\u0E23\\u0E34\\u0E21\\u0E32\\u0E15\\u0E23)</span><br>\
                                                    <strong class=\\" ").concat(check_dimension_text_use, " \\" style=\\"font-size:16px;\\"> ").concat(item.cost_dimension_percent != 0 ? numberWithCommas(item.cost_dimension_percent) : numberWithCommas(item.cost_dimension), "</strong>\
                                                </div>\
                                            </div>\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"text-center\\">\
                                                    <span class=\\"text-secondary\\">\\u0E1E\\u0E37\\u0E49\\u0E19\\u0E17\\u0E35\\u0E48\\u0E2B\\u0E48\\u0E32\\u0E07\\u0E44\\u0E01\\u0E25/\\u0E1E\\u0E37\\u0E49\\u0E19\\u0E17\\u0E35\\u0E48\\u0E17\\u0E48\\u0E2D\\u0E07\\u0E40\\u0E17\\u0E35\\u0E48\\u0E22\\u0E27</span><br>\
                                                    <strong class=\\"\\" style=\\"font-size:16px; color:gray\\">").concat(numberWithCommas(item.cost_remote), "</strong>\
                                                </div>\
                                            </div>\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"text-center\\">\
                                                    <span class=\\"text-secondary\\">\\u0E23\\u0E27\\u0E21</span><br>\
                                                    <strong class=\\"text-warning\\" style=\\"font-size:16px;\\">\\u0E17\\u0E38\\u0E19: ").concat(numberWithCommas(item.sum_cost), "</strong><br/>\
                                                    <strong class=\\"text-primary\\" style=\\"font-size:16px;\\">\\u0E02\\u0E32\\u0E22: ").concat(numberWithCommas(checker_path == 'order/edit' ? item.sum_price : customer_price), "</strong><br/>\
                                                    <strong class=\\"text-success\\" style=\\"font-size:16px;\\">\\u0E01\\u0E33\\u0E44\\u0E23: ").concat(numberWithCommas(item.profit), "</strong><br/>\
                                                </div>\
                                            </div>\
                                            <div class=\\"col-12 col-md-2\\">\
                                                <div class=\\"d-flex justify-content-center\\">\
                                                    <button class=\\"btn btn-sm btn-primary\\" onclick=\\"onUseCourier('").concat(item.courier_code, "')\\">\\u0E43\\u0E0A\\u0E49\\u0E07\\u0E32\\u0E19</button>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>");
        }

        content = content + ct;
      });
      $('.body-price').append(content);
      $('#comparePriceModal').modal('show');
    }
  }).fail(function (res) {
    showError('ไม่สามารถตรวจสอบราคาได้กรุณาตรวจสอบข้อมูล', 'ข้อความจากระบบ');
    $('#cover-spin').hide(0);
    $('#comparePriceModal').modal('hide');
  });
};

var showError = function showError(detail, title) {
  toastr.error(detail, title, {
    closeButton: true,
    tapToDismiss: false,
    rtl: isRtl
  });
  spin && $('#cover-spin').hide(0);
  return false;
};

var numberWithCommas = function numberWithCommas(x) {
  x = (Math.round(x * 100) / 100).toFixed(2);
  return x.toString().replace(/\\B(?<!\\.\\d*)(?=(\\d{3})+(?!\\d))/g, ",");
};//# sourceURL=[module]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGVja2VyX3BhdGgiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwic3BsaXQiLCJmaWx0ZXIiLCJCb29sZWFuIiwic2xpY2UiLCJqb2luIiwic3BpbiIsImFwcCIsIkFQUF9OQU1FIiwiY29tcGFyZVByaWNlIiwiJCIsInZhbCIsInNob3dFcnJvciIsInNob3ciLCJmb3JtRGF0YSIsInNlcmlhbGl6ZSIsImZvcm1EYXRhQXJyYXkiLCJzZXJpYWxpemVBcnJheSIsInB1c2giLCJuYW1lIiwidmFsdWUiLCJwYXJhbSIsImVtcHR5IiwiZ2V0IiwiZG9uZSIsInJlcyIsImxlbmd0aCIsImhpZGUiLCJjb250ZW50IiwiY3QiLCJjb3VyaWVyX25hbWUiLCJsb2dvIiwicmVjb21lbmQiLCJyZWNvbWVuZF90ZXh0IiwibWFwIiwiaXRlbSIsImluZGV4IiwiY291cmllcl9jb2RlIiwidG90YWxfcHJpY2UiLCJwYXJzZUZsb2F0IiwiY29zdCIsInByaWNlX3JlbW90ZSIsImNoZWNrX3dlaWdodF90ZXh0X3VzZSIsImNvc3Rfd2VpZ2h0IiwiY29zdF9yZW1vdGUiLCJzdW1fY29zdCIsImNoZWNrX2RpbWVuc2lvbl90ZXh0X3VzZSIsImN1c3RvbWVyX3ByaWNlIiwicHJpY2UiLCJjb3N0X2RpbWVuc2lvbl9wZXJjZW50IiwicHJpY2VfcG9saWNpZXMiLCJjb3N0X2RpbWVuc2lvbiIsImRpbWVuc2lvbl9wZXJjZW50IiwibWVzc2FnZSIsIm51bWJlcldpdGhDb21tYXMiLCJzdW1fcHJpY2UiLCJwcm9maXQiLCJhcHBlbmQiLCJtb2RhbCIsImZhaWwiLCJkZXRhaWwiLCJ0aXRsZSIsInRvYXN0ciIsImVycm9yIiwiY2xvc2VCdXR0b24iLCJ0YXBUb0Rpc21pc3MiLCJydGwiLCJpc1J0bCIsIngiLCJNYXRoIiwicm91bmQiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJyZXBsYWNlIl0sInNvdXJjZXMiOlsid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9tb2R1bGVzL2hlbHBlcnMuanM/MmQ4ZSJdLCJzb3VyY2VzQ29udGVudCI6WyIgICAgdmFyIGNoZWNrZXJfcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKS5zbGljZSgwLCAyKS5qb2luKCcvJyk7XG4gICAgdmFyIHNwaW4gPSAoY2hlY2tlcl9wYXRoICE9ICdwcmljZS10YWJsZScpID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHZhciBhcHAgPSB3aW5kb3cuQVBQX05BTUU7XG5cbiAgICB3aW5kb3cuY29tcGFyZVByaWNlID0gKCkgPT4gXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICgkKCcjd2VpZ2h0JykudmFsKCkgPT0gJycgfHwgJCgnI3dlaWdodCcpLnZhbCgpID09IDApIHsgc2hvd0Vycm9yKCfguIHguKPguLjguJPguLLguIHguKPguK3guIHguJnguYnguLPguKvguJnguLHguIEnLCAn4LiC4LmJ4Lit4Lih4Li54Lil4Lie4Lix4Liq4LiU4Li4Jyk7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgaWYgKCQoJyN3aWR0aCcpLnZhbCgpID09ICcnIHx8ICQoJyN3aWR0aCcpLnZhbCgpID09IDApIHsgc2hvd0Vycm9yKCfguIHguKPguLjguJPguLLguIHguKPguK3guIHguITguKfguLLguKHguIHguKfguYnguLLguIcnLCAn4LiC4LmJ4Lit4Lih4Li54Lil4Lie4Lix4Liq4LiU4Li4Jyk7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgaWYgKCQoJyNsZW5ndGgnKS52YWwoKSA9PSAnJyB8fCAkKCcjbGVuZ3RoJykudmFsKCkgPT0gMCkgeyBzaG93RXJyb3IoJ+C4geC4o+C4uOC4k+C4suC4geC4o+C4reC4geC4hOC4p+C4suC4oeC4ouC4suC4pycsICfguILguYnguK3guKHguLnguKXguJ7guLHguKrguJTguLgnKTsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICBpZiAoJCgnI2hlaWdodCcpLnZhbCgpID09ICcnIHx8ICQoJyNoZWlnaHQnKS52YWwoKSA9PSAwKSB7IHNob3dFcnJvcign4LiB4Lij4Li44LiT4Liy4LiB4Lij4Lit4LiB4LiE4Lin4Liy4Lih4Liq4Li54LiHJywgJ+C4guC5ieC4reC4oeC4ueC4peC4nuC4seC4quC4lOC4uCcpOyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIGlmICgkKCcjZHN0X3N1Yl9kaXN0cmljdCcpLnZhbCgpID09ICcnIHx8ICQoJyN3aWRodCcpLnZhbCgpID09IDApIHsgc2hvd0Vycm9yKCfguIHguKPguLjguJPguLLguIHguKPguK3guIHguJXguLPguJrguKXguJzguLnguYnguKPguLHguJonLCAn4LiC4LmJ4Lit4Lih4Li54Lil4Lic4Li54LmJ4Lij4Lix4LiaJyk7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgaWYgKCQoJyNkc3RfZGlzdHJpY3QnKS52YWwoKSA9PSAnJyB8fCAkKCcjd2lkaHQnKS52YWwoKSA9PSAwKSB7IHNob3dFcnJvcign4LiB4Lij4Li44LiT4Liy4LiB4Lij4Lit4LiB4Lit4Liz4LmA4Lig4Lit4Lic4Li54LmJ4Lij4Lix4LiaJywgJ+C4guC5ieC4reC4oeC4ueC4peC4nOC4ueC5ieC4o+C4seC4micpOyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIGlmICgkKCcjZHN0X3Byb3ZpY25lJykudmFsKCkgPT0gJycgfHwgJCgnI3dpZGh0JykudmFsKCkgPT0gMCkgeyBzaG93RXJyb3IoJ+C4geC4o+C4uOC4k+C4suC4geC4o+C4reC4geC4iOC4seC4h+C4q+C4p+C4seC4lOC4nOC4ueC5ieC4o+C4seC4micsICfguILguYnguK3guKHguLnguKXguJzguLnguYnguKPguLHguJonKTsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICBpZiAoJCgnI2RzdF96aXBjb2RlJykudmFsKCkgPT0gJycgfHwgJCgnI3dpZGh0JykudmFsKCkgPT0gMCkgeyBzaG93RXJyb3IoJ+C4geC4o+C4uOC4k+C4suC4geC4o+C4reC4geC4o+C4q+C4seC4quC5hOC4m+C4o+C4qeC4k+C4teC4ouC5jOC4nOC4ueC5ieC4o+C4seC4micsICfguILguYnguK3guKHguLnguKXguJzguLnguYnguKPguLHguJonKTsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgICQoJyNjb3Zlci1zcGluJykuc2hvdygwKVxuICAgICAgICAgICAgc3dpdGNoIChjaGVja2VyX3BhdGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwcmljZS10YWJsZSc6XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gJCgnI2FkZHJlc3NGb3JtJykuc2VyaWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ29yZGVyL2VkaXQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ29yZGVyL2NyZWF0ZSc6XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gJCgnI2NyZWF0ZU9yZGVyRm9ybScpLnNlcmlhbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdvcmRlci9jcmVhdGUtb3JkZXInOlxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9ybURhdGFBcnJheSA9ICQoJyNjcmVhdGVPcmRlckZvcm0nKS5zZXJpYWxpemVBcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YUFycmF5LnB1c2goeyBuYW1lOiBcIl90b2tlblwiLCB2YWx1ZTogJ3t7IGNzcmZfdG9rZW4oKSB9fScgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhID0gJC5wYXJhbShmb3JtRGF0YUFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCcuYm9keS1wcmljZScpLmVtcHR5KCk7XG4gICAgICAgICAgICAkLmdldChgL29yZGVyL2NvbXBhcmUtcHJpY2VgLGZvcm1EYXRhKS5kb25lKChyZXMpPT57XG4gICAgICAgICAgICAgICAgaWYocmVzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICAgICAkKCcjY292ZXItc3BpbicpLmhpZGUoMClcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb3VyaWVyX25hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvZ28gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlY29tZW5kID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZWNvbWVuZF90ZXh0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5tYXAoKGl0ZW0saW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFwcCA9PSAnU3VwZXJTaGlwJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZmxhc2ggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaExpdmUnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdGbGFzaCBFeHByZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLWxpdmUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnRmxhc2hFeHByZXNzQScpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0ZsYXNoIFBybyBBJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLWEucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtYS1tb2JpbGUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZmxhc2ggZnJ1aXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1NQU1hGTEFTSEZSVUlUJ3x8aXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hBRlJVSVQnfHxpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSFFGUlVJVCd8fGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNITElWRUZSVUlUJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnRmxhc2ggRnJ1aXQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtZnJ1aXQucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtZnJ1aXQtbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZsYXNoIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnRmxhc2hFeHByZXNzJyB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdTUFNYRkxBU0gnfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnU1BTWEZMQVNIUycgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRmxhc2hFeHByZXNzRCd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaEV4cHJlc3NTJ3x8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1NQU1hGTEFTSFknfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSCd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIQSd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIQVMnfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSFEnfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSExJVkUnfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRmxhc2hEcGx1cyd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaEV4cHJlc3NZJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0ZsYXNoIFBybyBCJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9mbGFzaCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoRXhwcmVzc0MnIHx8aXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1NQU1hGTEFTSEJVTEtZJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaEJ1bGt5J3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIQUJVTEtZJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIUUJVTEtZJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNITElWRUJVTEtZWCd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSEFCVUxLWVgnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hMSVZFQlVMS1knICApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0ZsYXNoIEJ1bGt5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLWJ1bGt5LnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0nREhMJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSdJU1BESEwnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0nRFBESEwnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdESEwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2RobC1leHByZXNzLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9kaGwtbW9iaWxlLnBuZydcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdKbnRFeHByZXNzJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnSVNQSk5UJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnSiZUIEV4cHJlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2pudC1leHByZXNzLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9qbnQtZXhwcmVzcy1tb2JpbGUucG5nJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ05pbmphVmFuJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdEUE5JTkpBJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnTmluamFWYW4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL25pbmphdmFuLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9uaW5qYXZhbi1tb2JpbGUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdTaG9wZWVFeHByZXNzJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdJU1BTUFgnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0nRFBTSE9QRUUnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdTaG9wZWVFeHByZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9zcHgucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL3NweC1tb2JpbGUuanBnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdUSFBfZVBhcmNlbCcgfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQVEhBSVBPU1QnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0lTUFRIUCd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSdUSFBfZVBhcmNlbFgnIHx8IGl0ZW0uY291cmllcl9jb2RlID09J0lTUFRIUFgnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICfguYTguJvguKPguKnguJPguLXguKLguYzguYTguJfguKIgKEVNUyknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL1RIUC1lUGFyY2VsLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9USFAtZVBhcmNlbC1tb2JpbGUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdLZXJyeUV4cHJlc3MnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQS0VSUlknfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQS0VSUllRJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBLRVJSWVMnIHx8IGl0ZW0uY291cmllcl9jb2RlID09ICdJU1BLRVgnICApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0tlcnJ5IEV4cHJlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2tlcnJ5LWV4cHJlc3MucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2tlcnJ5LWV4cHJlc3MtbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBCRVNURVhQUkVTUycgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdCZXN0IEV4cHJlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2Jlc3QtZXhwcmVzcy5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvYmVzdC1leHByZXNzLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoTGl2ZScpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0ZsYXNoIEV4cHJlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtbGl2ZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvZmxhc2gtZXhwcmVzcy1saXZlLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoRXhwcmVzc0EnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdGbGFzaCBQcm8gQSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvZmxhc2gtZXhwcmVzcy1hLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9mbGFzaC1leHByZXNzLWEtbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnU1BTWEZMQVNIRlJVSVQnfHxpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSEFGUlVJVCd8fGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIUUZSVUlUJ3x8aXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hMSVZFRlJVSVQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdGbGFzaCBGcnVpdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvZmxhc2gtZXhwcmVzcy1mcnVpdC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvZmxhc2gtZXhwcmVzcy1mcnVpdC1tb2JpbGUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZmxhc2ggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaEV4cHJlc3MnIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1NQU1hGTEFTSCd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdTUFNYRkxBU0hCVUxLWSd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdTUFNYRkxBU0hTJyB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaEV4cHJlc3NEJ3x8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoRXhwcmVzc1MnfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvdXJpZXJfY29kZSA9PSAnU1BTWEZMQVNIWSd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIJ3x8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hBJ3x8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hBUyd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNIUSd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNITElWRSd8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY291cmllcl9jb2RlID09ICdGbGFzaERwbHVzJ3x8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoRXhwcmVzc1knXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnRmxhc2ggUHJvIEInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnRmxhc2hFeHByZXNzQycgfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0ZsYXNoQnVsa3knfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hBQlVMS1knfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hRQlVMS1knfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hRQlVMS1knfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQRkxBU0hBQlVMS1lYJ3x8IGl0ZW0uY291cmllcl9jb2RlID09ICdEUEZMQVNITElWRUJVTEtZJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBGTEFTSExJVkVCVUxLWVgnICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnRmxhc2ggQnVsa3knO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtYnVsa3kucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2ZsYXNoLWV4cHJlc3MtYnVsa3ktbW9iaWxlLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSdESEwnIHx8IGl0ZW0uY291cmllcl9jb2RlID09J0lTUERITCd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSdEUERITCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ0RITCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvZGhsLWV4cHJlc3MucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2RobC1tb2JpbGUucG5nJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0pudEV4cHJlc3MnIHx8IGl0ZW0uY291cmllcl9jb2RlID09ICdJU1BKTlQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdKJlQgRXhwcmVzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3Mvam50LWV4cHJlc3MucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2pudC1leHByZXNzLW1vYmlsZS5wbmcnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvdXJpZXJfY29kZSA9PSAnTmluamFWYW4nfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQTklOSkEnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdOaW5qYVZhbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvbmluamF2YW4ucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL25pbmphdmFuLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1Nob3BlZUV4cHJlc3MnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0lTUFNQWCd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSdEUFNIT1BFRScpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ1Nob3BlZUV4cHJlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL3NweC5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3Mvc3B4LW1vYmlsZS5qcGcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ1RIUF9lUGFyY2VsJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBUSEFJUE9TVCd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnSVNQVEhQJ3x8IGl0ZW0uY291cmllcl9jb2RlID09J1RIUF9lUGFyY2VsWCcgfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0nSVNQVEhQWCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cmllcl9uYW1lID0gJ+C5hOC4m+C4o+C4qeC4k+C4teC4ouC5jOC5hOC4l+C4oiAoRU1TKSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dvID0gJy4uLy4uLy4uL2V4cHJlc3MvVEhQLWVQYXJjZWwucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL1RIUC1lUGFyY2VsLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0tlcnJ5RXhwcmVzcyd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBLRVJSWSd8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnRFBLRVJSWVEnfHwgaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQS0VSUllTJyB8fCBpdGVtLmNvdXJpZXJfY29kZSA9PSAnSVNQS0VYJyAgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJpZXJfbmFtZSA9ICdLZXJyeSBFeHByZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9rZXJyeS1leHByZXNzLnBuZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9rZXJyeS1leHByZXNzLW1vYmlsZS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3VyaWVyX2NvZGUgPT0gJ0RQQkVTVEVYUFJFU1MnICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VyaWVyX25hbWUgPSAnQmVzdCBFeHByZXNzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ28gPSAnLi4vLi4vLi4vZXhwcmVzcy9iZXN0LWV4cHJlc3MucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nbyA9ICcuLi8uLi8uLi9leHByZXNzL2Jlc3QtZXhwcmVzcy1tb2JpbGUucG5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbWVuZCA9ICdib3JkZXItcmVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb21lbmRfdGV4dCA9IGA8ZGl2IGNsYXNzPVwicmVjb21lbmQtdGV4dFwiPjxzcGFuIHN0eWxlPVwiY29sb3I6d2hpdGVcIj7guJbguLnguIHguJfguLXguYjguKrguLjguJQ8L3NwYW4+PC9kaXY+YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29tZW5kID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29tZW5kX3RleHQgPScnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgY29uZGl0aW9uIGNoZWNrIHBhZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrZXJfcGF0aCA9PSAnb3JkZXIvZWRpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxfcHJpY2UgPSBwYXJzZUZsb2F0KGl0ZW0uY29zdCkgKyBwYXJzZUZsb2F0KGl0ZW0ucHJpY2VfcmVtb3RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tfd2VpZ2h0X3RleHRfdXNlID0gcGFyc2VGbG9hdChpdGVtLmNvc3Rfd2VpZ2h0KSArICBwYXJzZUZsb2F0KGl0ZW0uY29zdF9yZW1vdGUpID09IGl0ZW0uc3VtX2Nvc3QgPyAndGV4dC1zdWNjZXNzJyA6ICd0ZXh0LWRhbmdlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tfZGltZW5zaW9uX3RleHRfdXNlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21lcl9wcmljZSA9IHBhcnNlRmxvYXQoaXRlbS5jdXN0b21lcl9wcmljZSkgID4gMCA/IGl0ZW0uY3VzdG9tZXJfcHJpY2UgOiBpdGVtLnByaWNlIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tZXJfcHJpY2UgPSBwYXJzZUZsb2F0KGN1c3RvbWVyX3ByaWNlKSArIHBhcnNlRmxvYXQoaXRlbS5wcmljZV9yZW1vdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbF9wcmljZSA9IHBhcnNlRmxvYXQoaXRlbS5jb3N0KSArIHBhcnNlRmxvYXQoaXRlbS5wcmljZV9yZW1vdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja193ZWlnaHRfdGV4dF91c2UgPSBwYXJzZUZsb2F0KGl0ZW0uY29zdF93ZWlnaHQpICsgIHBhcnNlRmxvYXQoaXRlbS5jb3N0X3JlbW90ZSkgPT0gaXRlbS5zdW1fY29zdCA/ICd0ZXh0LXN1Y2Nlc3MnIDogJ3RleHQtZGFuZ2VyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja19kaW1lbnNpb25fdGV4dF91c2UgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX2RpbWVuc2lvbl90ZXh0X3VzZSA9IHBhcnNlRmxvYXQoaXRlbS5jb3N0X2RpbWVuc2lvbl9wZXJjZW50KSArICBwYXJzZUZsb2F0KGl0ZW0uY29zdF9yZW1vdGUpID09IGl0ZW0uc3VtX2Nvc3QgPyAndGV4dC1zdWNjZXNzJyA6ICd0ZXh0LWRhbmdlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnByaWNlX3BvbGljaWVzID09ICdkaW1lbnNpb24nKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tfZGltZW5zaW9uX3RleHRfdXNlID0gJ3RleHQtc3VjY2VzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5jb3N0X3dlaWdodCA9PSBpdGVtLmNvc3RfZGltZW5zaW9uX3BlcmNlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja193ZWlnaHRfdGV4dF91c2UgPSAndGV4dC1kYW5nZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja19kaW1lbnNpb25fdGV4dF91c2UgPSAndGV4dC1zdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmNvc3Rfd2VpZ2h0ID09IGl0ZW0uY29zdF9kaW1lbnNpb24pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja193ZWlnaHRfdGV4dF91c2UgPSAndGV4dC1kYW5nZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja19kaW1lbnNpb25fdGV4dF91c2UgPSAndGV4dC1zdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnByaWNlX3BvbGljaWVzID09ICdkaW1lbnNpb24nICYmIGl0ZW0uZGltZW5zaW9uX3BlcmNlbnQgIT0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX3dlaWdodF90ZXh0X3VzZSA9ICd0ZXh0LXN1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja19kaW1lbnNpb25fdGV4dF91c2UgPSAndGV4dC1zdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLm1lc3NhZ2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdCA9IGA8ZGl2IGNsYXNzPVwiY2FyZCAke3JlY29tZW5kfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWJvZHlcIiBzdHlsZT1cImJhY2tncm91bmQ6I0YyRjNGNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3JlY29tZW5kX3RleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3cgYWxpZ24taXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTEyIGNvbC1tZC00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBtb2JpbGUtc3R5bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ299XCIgc3R5bGU9XCJ3aWR0aDogNDYlOyBoZWlnaHQ6IGF1dG87XCIgaWQ9XCJjb3VyaWVyLWxvZ29cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTEyIGNvbC1tZC04XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7aXRlbS5tZXNzYWdlfTwvc3Bhbj48YnI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdCA9IGA8ZGl2IGNsYXNzPVwiY2FyZCAke3JlY29tZW5kfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVjb21lbmRfdGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93IGFsaWduLWl0ZW1zLWNlbnRlciB0YWJsZS1yZXNwb25zaXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLW1kLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkLWZsZXggbW9iaWxlLXN0eWxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2xvZ299XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgaGVpZ2h0OiBhdXRvO1wiIGlkPVwiY291cmllci1sb2dvXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC0xMiBjb2wtbWQtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNlY29uZGFyeVwiPuC4hOC5iOC4suC4guC4meC4quC5iOC4hyjguJnguYnguLPguKvguJnguLHguIEpPC9zcGFuPjxicj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwiJHtjaGVja193ZWlnaHRfdGV4dF91c2V9XCIgc3R5bGU9XCJmb250LXNpemU6MTZweDtcIj4gJHtudW1iZXJXaXRoQ29tbWFzKGl0ZW0uY29zdF93ZWlnaHQpfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTEyIGNvbC1tZC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc2Vjb25kYXJ5XCI+4LiE4LmI4Liy4LiC4LiZ4Liq4LmI4LiHKOC4m+C4o+C4tOC4oeC4suC4leC4oyk8L3NwYW4+PGJyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCIgJHtjaGVja19kaW1lbnNpb25fdGV4dF91c2V9IFwiIHN0eWxlPVwiZm9udC1zaXplOjE2cHg7XCI+ICR7aXRlbS5jb3N0X2RpbWVuc2lvbl9wZXJjZW50ICE9IDAgPyBudW1iZXJXaXRoQ29tbWFzKGl0ZW0uY29zdF9kaW1lbnNpb25fcGVyY2VudCkgOiBudW1iZXJXaXRoQ29tbWFzKGl0ZW0uY29zdF9kaW1lbnNpb24pfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLTEyIGNvbC1tZC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc2Vjb25kYXJ5XCI+4Lie4Li34LmJ4LiZ4LiX4Li14LmI4Lir4LmI4Liy4LiH4LmE4LiB4LilL+C4nuC4t+C5ieC4meC4l+C4teC5iOC4l+C5iOC4reC4h+C5gOC4l+C4teC5iOC4ouC4pzwvc3Bhbj48YnI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cIlwiIHN0eWxlPVwiZm9udC1zaXplOjE2cHg7IGNvbG9yOmdyYXlcIj4ke251bWJlcldpdGhDb21tYXMoaXRlbS5jb3N0X3JlbW90ZSl9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtMTIgY29sLW1kLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zZWNvbmRhcnlcIj7guKPguKfguKE8L3NwYW4+PGJyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJ0ZXh0LXdhcm5pbmdcIiBzdHlsZT1cImZvbnQtc2l6ZToxNnB4O1wiPuC4l+C4uOC4mTogJHtudW1iZXJXaXRoQ29tbWFzKGl0ZW0uc3VtX2Nvc3QpfTwvc3Ryb25nPjxici8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzcz1cInRleHQtcHJpbWFyeVwiIHN0eWxlPVwiZm9udC1zaXplOjE2cHg7XCI+4LiC4Liy4LiiOiAke251bWJlcldpdGhDb21tYXMoKGNoZWNrZXJfcGF0aCA9PSAnb3JkZXIvZWRpdCcpID8gaXRlbS5zdW1fcHJpY2UgOiBjdXN0b21lcl9wcmljZSl9PC9zdHJvbmc+PGJyLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzPVwidGV4dC1zdWNjZXNzXCIgc3R5bGU9XCJmb250LXNpemU6MTZweDtcIj7guIHguLPguYTguKM6ICR7bnVtYmVyV2l0aENvbW1hcyhpdGVtLnByb2ZpdCl9PC9zdHJvbmc+PGJyLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC0xMiBjb2wtbWQtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImQtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc20gYnRuLXByaW1hcnlcIiBvbmNsaWNrPVwib25Vc2VDb3VyaWVyKCcke2l0ZW0uY291cmllcl9jb2RlfScpXCI+4LmD4LiK4LmJ4LiH4Liy4LiZPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQrY3Q7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkKCcuYm9keS1wcmljZScpLmFwcGVuZChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAkKCcjY29tcGFyZVByaWNlTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmZhaWwoKHJlcyk9PntcbiAgICAgICAgICAgICAgICBzaG93RXJyb3IoJ+C5hOC4oeC5iOC4quC4suC4oeC4suC4o+C4luC4leC4o+C4p+C4iOC4quC4reC4muC4o+C4suC4hOC4suC5hOC4lOC5ieC4geC4o+C4uOC4k+C4suC4leC4o+C4p+C4iOC4quC4reC4muC4guC5ieC4reC4oeC4ueC4pScsICfguILguYnguK3guITguKfguLLguKHguIjguLLguIHguKPguLDguJrguJonKTtcbiAgICAgICAgICAgICAgICAkKCcjY292ZXItc3BpbicpLmhpZGUoMClcbiAgICAgICAgICAgICAgICAkKCcjY29tcGFyZVByaWNlTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2hvd0Vycm9yID0gKGRldGFpbCwgdGl0bGUpID0+IHtcbiAgICAgICAgdG9hc3RyLmVycm9yKGRldGFpbCwgdGl0bGUsIHtcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgICAgICAgdGFwVG9EaXNtaXNzOiBmYWxzZSxcbiAgICAgICAgICAgIHJ0bDogaXNSdGxcbiAgICAgICAgfSk7XG4gICAgICAgIChzcGluKSAmJiAkKCcjY292ZXItc3BpbicpLmhpZGUoMCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgY29uc3QgbnVtYmVyV2l0aENvbW1hcyA9ICh4KSA9PiB7XG4gICAgICAgIHggPSAoTWF0aC5yb3VuZCh4ICogMTAwKSAvIDEwMCkudG9GaXhlZCgyKTtcbiAgICAgICAgcmV0dXJuIHgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPzwhXFwuXFxkKikoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIik7XG4gICAgfVxuIl0sIm1hcHBpbmdzIjoiQUFBSSxJQUFJQSxZQUFZLEdBQUdDLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsUUFBaEIsQ0FBeUJDLEtBQXpCLENBQStCLEdBQS9CLEVBQW9DQyxNQUFwQyxDQUEyQ0MsT0FBM0MsRUFBb0RDLEtBQXBELENBQTBELENBQTFELEVBQTZELENBQTdELEVBQWdFQyxJQUFoRSxDQUFxRSxHQUFyRSxDQUFuQjtBQUNBLElBQUlDLElBQUksR0FBSVQsWUFBWSxJQUFJLGFBQWpCLEdBQWtDLElBQWxDLEdBQXlDLEtBQXBEO0FBQ0EsSUFBSVUsR0FBRyxHQUFHVCxNQUFNLENBQUNVLFFBQWpCOztBQUVBVixNQUFNLENBQUNXLFlBQVAsR0FBc0IsWUFDbEI7RUFDSSxJQUFJQyxDQUFDLENBQUMsU0FBRCxDQUFELENBQWFDLEdBQWIsTUFBc0IsRUFBdEIsSUFBNEJELENBQUMsQ0FBQyxTQUFELENBQUQsQ0FBYUMsR0FBYixNQUFzQixDQUF0RCxFQUF5RDtJQUFFQyxTQUFTLENBQUMsa0JBQUQsRUFBcUIsYUFBckIsQ0FBVDtJQUE4QyxPQUFPLEtBQVA7RUFBZTs7RUFDeEgsSUFBSUYsQ0FBQyxDQUFDLFFBQUQsQ0FBRCxDQUFZQyxHQUFaLE1BQXFCLEVBQXJCLElBQTJCRCxDQUFDLENBQUMsUUFBRCxDQUFELENBQVlDLEdBQVosTUFBcUIsQ0FBcEQsRUFBdUQ7SUFBRUMsU0FBUyxDQUFDLG9CQUFELEVBQXVCLGFBQXZCLENBQVQ7SUFBZ0QsT0FBTyxLQUFQO0VBQWU7O0VBQ3hILElBQUlGLENBQUMsQ0FBQyxTQUFELENBQUQsQ0FBYUMsR0FBYixN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QixJQUFJLENBQUNTLFdBQU4sQ0F4QnhGLGloQkE4QjhFVSxnQkFBZ0IsQ0FBQ25CLElBQUksQ0FBQ1UsUUFBTixDQTlCOUYsOEpBK0I4RVMsZ0JBQWdCLENBQUV6RCxZQUFZLElBQUksWUFBakIsR0FBaUNzQyxJQUFJLENBQUNvQixTQUF0QyxHQUFrRFIsY0FBbkQsQ0EvQjlGLG9LQWdDK0VPLGdCQUFnQixDQUFDbkIsSUFBSSxDQUFDcUIsTUFBTixDQWhDL0YsMGFBcUNrRnJCLElBQUksQ0FBQ0UsWUFyQ3ZGLHVTQUFGO1FBMkNIOztRQUNEVCxPQUFPLEdBQUdBLE9BQU8sR0FBQ0MsRUFBbEI7TUFDUCxDQXJRRDtNQXNRQW5CLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIrQyxNQUFqQixDQUF3QjdCLE9BQXhCO01BQ0FsQixDQUFDLENBQUMsb0JBQUQsQ0FBRCxDQUF3QmdELEtBQXhCLENBQThCLE1BQTlCO0lBQ0g7RUFDSixDQWxSRCxFQWtSR0MsSUFsUkgsQ0FrUlEsVUFBQ2xDLEdBQUQsRUFBTztJQUNYYixTQUFTLENBQUMsMkNBQUQsRUFBOEMsZ0JBQTlDLENBQVQ7SUFDQUYsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQmlCLElBQWpCLENBQXNCLENBQXRCO0lBQ0FqQixDQUFDLENBQUMsb0JBQUQsQ0FBRCxDQUF3QmdELEtBQXhCLENBQThCLE1BQTlCO0VBQ0gsQ0F0UkQ7QUF1UlAsQ0FuVEQ7O0FBcVRBLElBQU05QyxTQUFTLEdBQUcsU0FBWkEsU0FBWSxDQUFDZ0QsTUFBRCxFQUFTQyxLQUFULEVBQW1CO0VBQ2pDQyxNQUFNLENBQUNDLEtBQVAsQ0FBYUgsTUFBYixFQUFxQkMsS0FBckIsRUFBNEI7SUFDeEJHLFdBQVcsRUFBRSxJQURXO0lBRXhCQyxZQUFZLEVBQUUsS0FGVTtJQUd4QkMsR0FBRyxFQUFFQztFQUhtQixDQUE1QjtFQUtDN0QsSUFBRCxJQUFVSSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCaUIsSUFBakIsQ0FBc0IsQ0FBdEIsQ0FBVjtFQUNBLE9BQU8sS0FBUDtBQUNILENBUkQ7O0FBVUEsSUFBTTJCLGdCQUFnQixHQUFHLFNBQW5CQSxnQkFBbUIsQ0FBQ2MsQ0FBRCxFQUFPO0VBQzVCQSxDQUFDLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFMLENBQVdGLENBQUMsR0FBRyxHQUFmLElBQXNCLEdBQXZCLEVBQTRCRyxPQUE1QixDQUFvQyxDQUFwQyxDQUFKO0VBQ0EsT0FBT0gsQ0FBQyxDQUFDSSxRQUFGLEdBQWFDLE9BQWIsQ0FBcUIsaUNBQXJCLEVBQXdELEdBQXhELENBQVA7QUFDSCxDQUhEIiwiZmlsZSI6Ii4vcmVzb3VyY2VzL2pzL21vZHVsZXMvaGVscGVycy5qcy5qcyIsInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=webpack-internal:///./resources/js/modules/helpers.js
