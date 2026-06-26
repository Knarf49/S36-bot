/**
 * =============================================================================
 * TWENTYEXPRESS ORDER CREATE - PRICE CALCULATION LOGIC (CLIENT-SIDE)
 * =============================================================================
 * หน้านี้ใช้ Laravel (PHP) backend + jQuery frontend
 * การคำนวณราคาจริงทำฝั่ง server ผ่าน AJAX — client แค่ validate + เรียก API
 */

// =============================================================================
// 1. CONVERT WEIGHT (kg <-> gram)
// =============================================================================
function onChangeWeight(type) {
    let kg = $('#kg_weight').val()
    let gram = $('#gram_weight').val()
    if(type == 1){
        $('#gram_weight').val(kg*1000)      // kg -> gram
        $('#weight').val(kg*1000)           // weight เก็บเป็น gram
    } else {
        if(gram !== 0 && gram !== ''){
            $('#kg_weight').val(gram/1000)  // gram -> kg
            $('#weight').val(gram)
        } else {
            $('#kg_weight').val(0)
            $('#weight').val(0)
        }
    }
}

// =============================================================================
// 2. CHECK PARCEL — validate + check courier options
//    Trigger: onchange="checkPacel()" on #courier_code
// =============================================================================
function checkPacel(action = 0) {
    let category_id = $('#category_id').val();
    let weight = parseFloat($('#weight').val());
    let width = parseFloat($('#width').val());
    let length = parseFloat($('#length').val());
    let height = parseFloat($('#height').val());
    let courier_code = $('#courier_code').val();
    let check_parcel = width + length + height;  // sum of dimensions

    checkCourierOpt();  // check courier capabilities

    // Show/hide pickup class by courier
    // JNT: show #jnt-pickup-class for JntExpress, JntBangkok
    // Kerry: show #kerry-pickup-class for KerryExpress, ISPKEX, DPKERRY, DPKERRYQ, DPKERRYS, DPKERRYBULKY
}

// =============================================================================
// 3. CHECK COURIER OPTIONS — check capabilities per courier
//    Calls: GET "/check-courier" with { courier_code }
// =============================================================================
function checkCourierOpt() {
    let courier_code = $('#courier_code').val();
    let product_value = $('#product_value').val();

    $.get(`/check-courier`, { 'courier_code': courier_code }).done((res) => {
        // res.is_insurance  -> show/hide #divInsurance
        // res.is_urgent     -> show/hide #divUrgent
        // res.is_box_shield -> show/hide #divBoxShield
        // res.cod_mode      -> show/hide #divCod
    });
}

// =============================================================================
// 4. COMPARE PRICE — main price comparison (calls server)
//    Trigger: button click
//    API: GET "/order/compare-price" with form data
// =============================================================================
function comparePrice(data = null) {
    // Validate: weight, width, length, height, dst_sub_district, dst_district, dst_zipcode
    // On error: show toastr error, return false

    let formData;
    let checker_path = window.location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');

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
            formDataArray.push({ name: "_token", value: csrf });
            formData = $.param(formDataArray);
            break;
    }

    $.get("/order/compare-price", formData).done(function(res) {
        // res returns HTML from server that populates .body-price
        $('.body-price').html(res);

        // Read calculated fields (filled by server)
        let dropoff_cost_price = $('#dropoff_cost_price').val();
        let actual_price = $('#actual_price').val();
        let dropoff_shop_price = $('#dropoff_shop_price').val();
        let total_price = $('#total_price').val();
        let remote_price = $('#remote_price').val();
        let weight_weight = $('#weight_weight').val();
        let weight_dimension = $('#weight_dimension').val();
        let weight_side = $('#weight_side').val();
        let actual_price_bulky = $('#actual_price_bulky').val();
        let gas_fee = $('#gas_fee').val();
        // ... more fields
    });
}

// =============================================================================
// 5. CHECK PRICE — validate + submit for price calculation
//    API: (contained in form, presumably POST to same page or /order/check-price)
// =============================================================================
function checkPrice(action = 0) {
    // Validate: dst_name, dst_phone, dst_zipcode, dst_sub_district, dst_district,
    //           dst_province, weight, width, length, height
    // Reset all price display fields to 0
    // Calls AJAX to get pricing
}

// =============================================================================
// 6. CALCULATE TABLE — update order log row
//    API: GET "/order/update-order-log" with params
// =============================================================================
function calculateTable(id) {
    let price = $(`#product_price_${id}`).val();
    let remote_area = $(`#remote_area_${id}`).val();
    let product_qty = $(`#product_qty_${id}`).val();
    let gas_fee = $(`#gas_fee_${id}`).val();

    $.get('/order/update-order-log', {
        '_token': csrf,
        'order_log_id': id,
        'product_price': parseFloat(price),
        'remote_area': parseFloat(remote_area),
        'product_qty': parseFloat(product_qty),
        'gas_fee': parseFloat(gas_fee),
    }).done((res) => {
        if (res.status) {
            loadCartLogs();
            calculateSummary();
        }
    });
}

// =============================================================================
// 7. CALCULATE SUMMARY — totals of all order logs
//    API: GET "/order/calculate-order-log/"
// =============================================================================
function calculateSummary() {
    let discount_value = $('#discount_value').val();
    let discount_type = $('#discount_type').val();  // 1 = flat, 2 = percentage

    $.get('/order/calculate-order-log/').done((res) => {
        if (res.status) {
            let sum_shipping_fee = res.data.sum_shipping_fee || 0;
            let sum_cod_fee = res.data.sum_cod_fee || 0;
            let sum_insurance_fee = res.data.sum_insurance_fee || 0;
            let total = res.data.sum_total_price || 0;
            let total_amount = res.data.sum_total_price || 0;

            $('#total').val(total.toFixed(2));
            $('#total_amount').val(total_amount.toFixed(2));
            $('#cash').val(total_amount.toFixed(2));

            // Apply discount if set
            // discount_type == 1: flat discount (sum_shipping_fee - discount_value)
            // discount_type == 2: percentage (total * discount_value / 100)
            if (discount_value != 0) {
                if (discount_type == 1) {
                    sum_shipping_fee = parseFloat(sum_shipping_fee) - parseFloat(discount_value);
                    $('#discount').val(parseFloat(discount_value).toFixed(2));
                }
                if (discount_type == 2) {
                    let percent = (parseFloat(total) * parseFloat(discount_value)) / 100;
                    sum_shipping_fee = parseFloat(sum_shipping_fee) - percent;
                    $('#discount').val(percent.toFixed(2));
                }
                // Recalculate total_amount
            }
        }
    });
}

// =============================================================================
// 8. CALCULATE DISCOUNT — standalone discount calc
// =============================================================================
function calculateDiscount() {
    let total_amount = $('#total').val();
    let discount_value = $('#discount_value').val();
    let discount_type = $('#discount_type').val();  // 1 = flat, 2 = percentage

    if (total_amount != 0) {
        if (discount_type == 1) {        // Flat discount
            new_total = parseFloat(total_amount) - parseFloat(discount_value);
        }
        if (discount_type == 2) {        // Percentage discount
            let percent = (parseFloat(total_amount) * parseFloat(discount_value)) / 100;
            new_total = total_amount - percent;
        }
        $('#total_amount').val(new_total.toFixed(2));
        $('#cash').val('0.00');
        $('#change').val('0.00');
    }
}

// =============================================================================
// 9. CALCULATE CASH / CHANGE
// =============================================================================
function calCash() {
    let cash = parseFloat($('#cash').val());
    let total = parseFloat($('#total_amount').val());

    if (cash < total) {
        // Error: not enough cash
    } else {
        let change = cash.toFixed(2) - total.toFixed(2);
        $('#change').val(parseFloat(change).toFixed(2));
    }
}

// =============================================================================
// 10. CHECK AREA — validate receiver address via server
//     API: GET "/address/check-area" with { zipcode, district, amphure, province }
// =============================================================================
function checkArea() {
    $.get('/address/check-area', {
        'zipcode': $('#dst_zipcode').val(),
        'district': $('#dst_sub_district').val(),
        'amphure': $('#dst_district').val(),
        'province': $('#dst_province').val(),
    }).done((res) => {
        if (!res.status) {
            toastr.error(res.data, 'ที่อยู่ผู้รับไม่ถูกต้อง');
            return false;
        }
    });
}

// =============================================================================
// KEY SERVER-SIDE ENDPOINTS
// =============================================================================
// GET  /order/compare-price         — main price comparison (returns HTML)
// GET  /order/check-price           — validate + calculate price
// GET  /order/calculate-order-log/  — calculate summary of all order logs
// GET  /order/update-order-log      — update single order log line
// GET  /check-courier               — check courier capabilities (insurance, urgent, box_shield, COD)
// GET  /address/check-area          — validate receiver address

// =============================================================================
// PRICE BREAKDOWN FIELDS (filled by server response)
// =============================================================================
// #dropoff_cost_price          — ราคาทุน
// #actual_price                — ราคาขาย
// #actual_price_bulky          — ราคาขาย (bulky)
// #total_price                 — ราคารวม
// #dropoff_shop_price          — ราคาค่าหน้าร้าน
// #remote_price                — ค่าพื้นที่ห่างไกล
// #weight_weight               — น้ำหนักที่ใช้คิดราคา
// #weight_dimension            — น้ำหนักเชิงปริมาตร
// #weight_side                 — น้ำหนักด้าน
// #gas_fee                     — ค่าน้ำมันส่วนเพิ่ม
// #dropoff_cost_remote_price   — ราคาทุนพื้นที่ห่างไกล
// #dropoff_cost_dimension_price — ราคาทุนมิติ
// #dropoff_cost_cod_fee        — ค่าธรรมเนียม COD
// #dropoff_insurance_fee_price — ค่าธรรมเนียมประกัน
// #price_box_shield_fee        — ค่าธรรมเนียมประกันกล่อง
// #dropoff_on_time_price       — ราคา on-time
// #dropoff_cost_policies       — ราคาตามนโยบาย
// #discount_value              — มูลค่าส่วนลด
// #discount_type               — ประเภทส่วนลด (1=flat, 2=%)

// =============================================================================
// FORM ACTIVE FIELDS (for user input)
// =============================================================================
// #kg_weight / #gram_weight / #weight — น้ำหนัก (gram)
// #width / #length / #height           — ขนาด (cm)
// #courier_code                        — ขนส่ง
// #box_id                              — ขนาดกล่อง
// #category_id                         — ประเภทพัสดุ
// #cod_amount                          — จำนวนเงิน COD
// #product_value                       — มูลค่าสินค้า (for insurance)
// #insurance_x                         — ประกันพัสดุ checkbox
// #is_urgentx                          — ด่วน checkbox
// #is_box_shieldx                      — ประกันกล่อง checkbox
// #bank_id / #account_name / #account_number — บัญชีธนาคาร (COD)
