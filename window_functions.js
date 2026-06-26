

// === WritableStreamDefaultWriter ===
function WritableStreamDefaultWriter() { [native code] }


// === WritableStreamDefaultController ===
function WritableStreamDefaultController() { [native code] }


// === WritableStream ===
function WritableStream() { [native code] }


// === WindowControlsOverlayGeometryChangeEvent ===
function WindowControlsOverlayGeometryChangeEvent() { [native code] }


// === VirtualKeyboardGeometryChangeEvent ===
function VirtualKeyboardGeometryChangeEvent() { [native code] }


// === TaskPriorityChangeEvent ===
function TaskPriorityChangeEvent() { [native code] }


// === Selection ===
function Selection() { [native code] }


// === RTCDTMFToneChangeEvent ===
function RTCDTMFToneChangeEvent() { [native code] }


// === NavigationCurrentEntryChangeEvent ===
function NavigationCurrentEntryChangeEvent() { [native code] }


// === IDBVersionChangeEvent ===
function IDBVersionChangeEvent() { [native code] }


// === HashChangeEvent ===
function HashChangeEvent() { [native code] }


// === HTMLTableSectionElement ===
function HTMLTableSectionElement() { [native code] }


// === HTMLTableRowElement ===
function HTMLTableRowElement() { [native code] }


// === HTMLTableElement ===
function HTMLTableElement() { [native code] }


// === HTMLTableColElement ===
function HTMLTableColElement() { [native code] }


// === HTMLTableCellElement ===
function HTMLTableCellElement() { [native code] }


// === HTMLTableCaptionElement ===
function HTMLTableCaptionElement() { [native code] }


// === HTMLSelectedContentElement ===
function HTMLSelectedContentElement() { [native code] }


// === HTMLSelectElement ===
function HTMLSelectElement() { [native code] }


// === ContentVisibilityAutoStateChangeEvent ===
function ContentVisibilityAutoStateChangeEvent() { [native code] }


// === getSelection ===
function getSelection() { [native code] }


// === ClipboardChangeEvent ===
function ClipboardChangeEvent() { [native code] }


// === CookieChangeEvent ===
function CookieChangeEvent() { [native code] }


// === FileSystemWritableFileStream ===
function FileSystemWritableFileStream() { [native code] }


// === PaymentMethodChangeEvent ===
function PaymentMethodChangeEvent() { [native code] }


// === XRInputSourcesChangeEvent ===
function XRInputSourcesChangeEvent() { [native code] }


// === XRVisibilityMaskChangeEvent ===
function XRVisibilityMaskChangeEvent() { [native code] }


// === DataTable ===
function(a,b){if(this instanceof u)return l(a).DataTable(b);b=a;this.$=function(f,g){return this.api(!0).$(f,g)};this._=function(f,g){return this.api(!0).rows(f,g).data()};this.api=function(f){return f?new B(Ta(this[M.iApiIndex])):new B(this)};this.fnAddData=
function(f,g){var k=this.api(!0);f=Array.isArray(f)&&(Array.isArray(f[0])||l.isPlainObject(f[0]))?k.rows.add(f):k.row.add(f);(g===q||g)&&k.draw();return f.flatten().toArray()};this.fnAdjustColumnSizing=function(f){var g=this.api(!0).columns.adjust(),k=g.settings()[0],m=k.oScroll;f===q||f?g.draw(!1):(""!==m.sX||""!==m.sY)&&Ha(k)};this.fnClearTable=function(f){var g=this.api(!0).clear();(f===q||f)&&g.draw()};this.fnClose=function(f){this.api(!0).row(f).child.hide()};this.fnDeleteRow=function(f,g,k){var m=
this.api(!0);f=m.rows(f);var n=f.settings()[0],p=n.aoData[f[0][0]];f.remove();g&&g.call(this,n,p);(k===q||k)&&m.draw();return p};this.fnDestroy=function(f){this.api(!0).destroy(f)};this.fnDraw=function(f){this.api(!0).draw(f)};this.fnFilter=function(f,g,k,m,n,p){n=this.api(!0);null===g||g===q?n.search(f,k,m,p):n.column(g).search(f,k,m,p);n.draw()};this.fnGetData=function(f,g){var k=this.api(!0);if(f!==q){var m=f.nodeName?f.nodeName.toLowerCase():"";return g!==q||"td"==m||"th"==m?k.cell(f,g).data():
k.row(f).data()||null}return k.data().toArray()};this.fnGetNodes=function(f){var g=this.api(!0);return f!==q?g.row(f).node():g.rows().nodes().flatten().toArray()};this.fnGetPosition=function(f){var g=this.api(!0),k=f.nodeName.toUpperCase();return"TR"==k?g.row(f).index():"TD"==k||"TH"==k?(f=g.cell(f).index(),[f.row,f.columnVisible,f.column]):null};this.fnIsOpen=function(f){return this.api(!0).row(f).child.isShown()};this.fnOpen=function(f,g,k){return this.api(!0).row(f).child(g,k).show().child()[0]};
this.fnPageChange=function(f,g){f=this.api(!0).page(f);(g===q||g)&&f.draw(!1)};this.fnSetColumnVis=function(f,g,k){f=this.api(!0).column(f).visible(g);(k===q||k)&&f.columns.adjust().draw()};this.fnSettings=function(){retur


// === comparePrice ===
function comparePrice(data = null)
    {
        $('#filter-text').empty();
        if ($('#weight').val() == '' || $('#weight').val() == 0) {
            toastr['error']('กรุณากรอกน้ำหนัก', 'ข้อมูลพัสดุ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false
        }
        if ($('#width').val() == '' || $('#width').val() == 0) {
            toastr['error']('กรุณากรอกความกว้าง', 'ข้อมูลพัสดุ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        if ($('#length').val() == '' || $('#length').val() == 0) {
            toastr['error']('กรุณากรอกความยาว', 'ข้อมูลพัสดุ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        if ($('#height').val() == '' || $('#height').val() == 0) {
            toastr['error']('กรุณากรอกความสูง', 'ข้อมูลพัสดุ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        if ($('#dst_sub_district').val() == '' || $('#widht').val() == 0) {
            toastr['error']('กรุณากรอกตำบลผู้รับ', 'ข้อมูลผู้รับ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        if ($('#dst_district').val() == '' || $('#widht').val() == 0) {
            toastr['error']('กรุณากรอกอำเภอผู้รับ', 'ข้อมูลผู้รับ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            retur


// === checkPrimaryAddress ===
function checkPrimaryAddress(){
        if ($('#primary_address').val() === '') {
            Swal.fire({
                    title: 'ข้อความจากระบบ',
                    text: 'ยังไม่มีที่อยู่เข้ารับพัสดุ',
                    icon: 'warning',
                    confirmButtonText: 'ไปตั้งค่าที่อยู่',
                    confirmButtonColor: '#F0E75A',
                    allowOutsideClick: false
                })
                .then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        // pageBlock.attr('disabled',true);
                        window.location = '/address';
                    }
                });
        }
    }


// === checkCartAddress ===
function checkCartAddress() {
        $.get(`/order/check-cart-address`).done((res)=>{
            if(res.status){
                $.get(`/address/search-customer`,{'keyword':res.data.phone}).done((res)=>{
                    if(res.status){
                        has_label_info = 1; 
                        $('#customer_id').val(res.data.id)
                        $('#label_name').val(res.data.name)
                        $('#label_phone').val(res.data.phone)
                        if(res.data.card_id != null && res.data.card_id != 'null' && res.data.card_id != 'undefined' ){
                            $('#card_id').val(res.data.card_id)
                        }
                        $('#label_address_id').val(res.data.address.id)
                        $('#label_address').val(res.data.address.address)
                        $('#label_sub_district').val(res.data.address.sub_district)
                        $('#label_district').val(res.data.address.district)
                        $('#label_province').val(res.data.address.province)
                        $('#label_zipcode').val(res.data.address.zipcode)
                        $('.thailand_keyword').val(`${res.data.address.sub_district} » ${res.data.address.district} » ${res.data.address.province} » ${res.data.address.zipcode}`)
                        $('.thailand_keyword').prop('readonly', true);

                        if(res.data.bank_id !== null && res.data.account_name !== null && res.data.account_number !== null  ){
                            $('#accountCollapse').collapse('show')
                            $('.btn-add-account').addClass('d-none')
                            $('#bank_id').val(res.data.bank_id).change()
                            $('#account_name').val(res.data.account_name)
                            $('#account_number').val(res.data.account_number)
                            // $('#branch_no').val(res.data.branch_no)

                            // $('#bank_id').attr("disa


// === onChangeWeight ===
function onChangeWeight(type) {
        let kg = $('#kg_weight').val()
        let gram = $('#gram_weight').val()
        if(type == 1){
            $('#gram_weight').val(kg*1000)
            $('#weight').val(kg*1000)
        }else{
            if(gram !== 0 && gram !== ''){
                $('#kg_weight').val(gram/1000)
                $('#weight').val(gram)
            }else{
                $('#kg_weight').val(0)
                $('#weight').val(0)
            }
        }
    }


// === checkCourierOpt ===
function checkCourierOpt() {
        // is_insuranced = 0;
        // $('#is_insuranced').val('no')
        let courier_code = $('#courier_code').val();
        let product_value = $('#product_value').val();
        $('.div-pre-barcode').addClass('d-none')
        if(courier_code == 'DPTHAIPOST' || courier_code == 'DPTHAIPOSTS' || courier_code == 'THP_eParcel'|| courier_code == 'THP_eParcelX'){
            $('.div-pre-barcode').removeClass('d-none')
        }
        $.get(`/check-courier`,{
            'courier_code':courier_code
        }).done((res)=>{
            if(res.is_insurance == 1){
                $('#divInsurance').removeClass('d-none')
                $('#product_value').val(product_value)
                $('#is_insuranced').val('yes')
            }else{
                $('#insurance_x').prop('checked', false);
                $('#product_value').val('')
                $('#is_insured').val(0)
                $('#divInsurance').addClass('d-none')
                $('#collapseInsurance').collapse('hide')
                $('#is_insuranced').val('no')
            }
            if(res.is_urgent == 1){
                $('#divUrgent').removeClass('d-none')
            }else{
                $('#is_urgentx').prop('checked', false);
                $('#express_category').val(1)
                $('#divUrgent').addClass('d-none')
            }
            if(res.is_box_shield == 1){
                $('#divBoxShield').removeClass('d-none')
            }else{
                $('#is_box_shieldx').prop('checked', false);
                $('#is_box_shield').val(0)
                $('#divBoxShield').addClass('d-none')
            }
            if(res.cod_mode == 1){
                $('#divCod').removeClass('d-none')
            }else{
                $('#divCod').addClass('d-none')
            }
            
        })
    }


// === checkOptionCourierCode ===
function checkOptionCourierCode(element)
    {
        ($(element).val() == 'DPTHAIPOST') ? $('#thai_post_alert').removeClass('d-none') :  $('#thai_post_alert').addClass('d-none');
    }


// === checkPacel ===
function checkPacel(action = 0) {
        $('#jnt-text-alert').text('');
        $('#kerry-text-alert').text('');
        $('#check_condition_pacel').empty()

        let category_id = $('#category_id').val();
        let weight = $('#weight').val();
        let width = $('#width').val();
        let length = $('#length').val();
        let height = $('#height').val();
        let courier_code = $('#courier_code').val();
        checkCourierOpt()

        $('#jnt-pickup-class').addClass('d-none')
        if (courier_code === 'JntExpress' || courier_code === 'JntBangkok'){
            $('#jnt-pickup-class').removeClass('d-none')
        }
        $('#kerry-pickup-class').addClass('d-none')
        if (courier_code === 'KerryExpress' || courier_code === 'ISPKEX'|| courier_code === 'DPKERRY'|| courier_code === 'DPKERRYQ'|| courier_code === 'DPKERRYS' || courier_code === 'DPKERRYBULKY'){
            $('#kerry-pickup-class').removeClass('d-none')
            // $('#jnt-text-alert').text('ขนส่ง Kerry Express เข้ารับฟรี 3ขึ้นไป (1-2 ชิ้นเริ่มต้น 15 บาท )')
        }
        weight = parseFloat(weight)
        width = parseFloat(width)
        length = parseFloat(length)
        height = parseFloat(height)
        let data = {
            category_id: category_id,
            weight: weight,
            width: width,
            length: length,
            height: height,
        }
        let check_parcel = parseFloat(data.width) + parseFloat(data.length) + parseFloat(data.height);
        // if(category_id == 11 && courier_code !== 'FlashExpressA'){
        //     $('#check_condition_pacel').text(`ประเภทผลไม้ ต้องเลือก Flash Pro A เท่านั้น`)
        //     $('#check_condition_pacel').addClass('text-danger')
        //     $('#txt_cost_price').text(0)
        //     $('#dropoff_cost_price').val(0)
        //     $('#txt_shop_price').text(0)
        //     $('#dropoff_shop_price').val(0)
        //     $('#txt_remote_price').text(0)
        //     $('#remote_price').val(0)



// === checkPrice ===
function checkPrice(action = 0) {
        let label_address = $('#label_address').val()
        
        var formDataArray = $('#createOrderForm').serializeArray();
        formDataArray.push({ name: "cod_amount", value: $('[name="cod_amount"]').val() });
        formDataArray.push({ name: "_token", value: 'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su'});

          // Convert array to query string format
        var formData = $.param(formDataArray);

        let dst_name = $('#dst_name').val()
        let dst_phone = $('#dst_phone').val()
        let dst_zipcode = $('#dst_zipcode').val()
        let dst_sub_district = $('#dst_sub_district').val()
        let dst_district = $('#dst_district').val()

        let weight = $('#weight').val();
        let width = $('#width').val();
        let length = $('#length').val();
        let height = $('#height').val();

        $('.txt_customer_price').addClass('d-none')
        $('#txt_customer_price').text(0)
        $('#dropoff_customer_price').val(0)

        $('.txt_cost_remote_price').addClass('d-none')
        $('#txt_cost_remote_price').text(0)
        $('#dropoff_cost_remote_price').val(0)

        $('.txt_cost_dimension_price').addClass('d-none')
        $('#txt_cost_dimension_price').text(0)
        $('#dropoff_cost_dimension_price').val(0)

        $('.txt_remote_price').addClass('d-none')
        if(dst_name == ''){
            return false
        }
        if(dst_phone == ''){
            return false
        }
        if(dst_zipcode == ''){
            return false
        }
        if(dst_sub_district == ''){
            return false
        }
        if(dst_district == ''){
            return false
        }
        if(dst_province == ''){
            return false
        }
        if(weight == ''){
            return false
        }
        if(width == ''){
            return false
        }
        if(length == ''){
            return false
        }
        if(height == ''){
            return false
        }


// === checkArea ===
function checkArea() {
        let dst_zipcode = $('#dst_zipcode').val()
        let dst_sub_district = $('#dst_sub_district').val()
        let dst_district = $('#dst_district').val()
        let dst_province = $('#dst_province').val()

         $.get(`/address/check-area`,{
            'zipcode':dst_zipcode,
            'district':dst_sub_district,
            'amphure':dst_district,
            'province':dst_province,
        }).done((res)=>{
            if(!res.status){
                toastr['error'](res.data, 'ที่อยู่ผู้รับไม่ถูกต้อง', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                $('#cover-spin').hide(0)

                return false;
            }
        })
    }


// === checkBranch ===
function checkBranch() {
        let val = $("[name='is_branch']:checked").val();
        // $('#branch').val(0)
        if (val == 'sub_company') {
            $( "#invoice_branch" ).prop( "disabled", false );
            $('#invoice_branch').val()
       
        } else {
            $( "#invoice_branch" ).prop( "disabled", true );
            $('#invoice_branch').val('')
           
        }
    }


// === calculateTable ===
function calculateTable(id) {
        let price = $(`#product_price_${id}`).val();
        let remote_area = $(`#remote_area_${id}`).val();
        let product_qty = $(`#product_qty_${id}`).val();
        let gas_fee = $(`#gas_fee_${id}`).val();

        $.get('/order/update-order-log', {
            '_token': 'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su',
            'order_log_id': id,
            'product_price': parseFloat(price),
            'remote_area': parseFloat(remote_area),
            'product_qty': parseFloat(product_qty),
            'gas_fee': parseFloat(gas_fee),
        }).done((res) => {
            if (res.status) {
                loadCartLogs();
                calculateSummary();
                $.get('/still-alive').done(res => {
                    $('.user-credit').text(`เครดิต : ${res.credits}`)
                })
            }
        })

    }


// === calculateSummary ===
function calculateSummary() {
        let sum_shipping_fee =0;
        let sum_cod_fee = 0;
        let sum_insurance_fee = 0;
        let total = 0;
        let total_amount = 0;

        let discount_value = $('#discount_value').val()
        let discount_type = $('#discount_type').val()
        let new_total_amount = total_amount
        let percent_discount = 0

        let shipping_fee_hold = 0;
        let cod_fee_hold = 0;
        let insurance_fee_hold = 0;
        let shipping_fee_discount = 0;
        $('#discount').val(0)
        //updated
        $.get('/order/calculate-order-log/').done((res) => {
            if (res.status) {
                
                 sum_shipping_fee = res.data.sum_shipping_fee == null ? 0 :res.data.sum_shipping_fee;
                 sum_cod_fee = res.data.sum_cod_fee== null ? 0 :res.data.sum_cod_fee;
                 sum_insurance_fee = res.data.sum_insurance_fee== null ? 0 :res.data.sum_insurance_fee;
                 total = res.data.sum_total_price== null ? 0 :res.data.sum_total_price;
                 total_amount = res.data.sum_total_price== null ? 0 :res.data.sum_total_price;

                $('#total').val(total.toFixed(2))
                $('#total_amount').val(total_amount.toFixed(2))
                $('#cash').val(total_amount.toFixed(2))
                sum_total = sum_shipping_fee + sum_cod_fee + sum_insurance_fee;
                shipping_fee_discount = sum_shipping_fee + sum_cod_fee + sum_insurance_fee;
                if(discount_value != 0){
                    if(discount_type == 1){
                        sum_shipping_fee = parseFloat(sum_shipping_fee) - parseFloat(discount_value)
                         $('#discount').val(parseFloat(discount_value).toFixed(2))
                        sum_shipping_fee = parseFloat(sum_shipping_fee)
                        shipping_fee_discount = sum_shipping_fee
                    }
                    if(discount_type == 2){
                        percent_discount = (p


// === onSelectProduct ===
function onSelectProduct() {
        $('#selectProductModal').modal('show')
        loadProductTable()
    }


// === calCash ===
function calCash() {
        let cash = $('#cash').val();
        let total = $('#total_amount').val();

        if (parseFloat(cash) < parseFloat(total)) {
            toastr['warning']('กรุณากรอกจำนวนเงินให้ถูกต้อง', 'จำนวนเงิน', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#change').val(0);
            $('#cash').val(0);
        } else {
            let cal = parseFloat(cash).toFixed(2) - parseFloat(total).toFixed(2);
            $('#change').val(parseFloat(cal).toFixed(2));
        }
    }


// === loadProductTable ===
function loadProductTable() {
        let selectProductTable = $('#selectProductTable').DataTable({
            processing: true,
            serverSide: true,
            destroy: true,
            paging: false,
            ajax: {
                url: "/order/product-list"
            },
            columns: [{
                    "data": 'DT_RowIndex',
                    "name": 'DT_RowIndex'
                },
                {
                    "data": "name"
                },
                {
                    "data": "cost_price"
                },
                {
                    "data": "sell_price"
                },
                {
                    "data": "qty"
                },
                {
                    "data": "action",
                    "name": 'action'
                }
            ]
        });
    }


// === selectProduct ===
function selectProduct(product_id) {
        var customer_id = $('#customer_id').val();
        $.post('/order/add-product-to-cart', {
                '_token':'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su',
                'product_id': product_id,
                'customer_id': customer_id
            }).done((res) => {
                if(res.status){
                    $('#selectProductModal').modal('hide')
                    loadCartLogs()
                    calculateSummary()
                }

            });
   
    }


// === onUseCourier ===
function onUseCourier(code) {
        $("#courier_code").val(code).change();
        $('#comparePriceModal').modal('hide');
    }


// === onSelectTracking ===
function onSelectTracking() {
        $('#selectTracking').modal('show')
    }


// === onChangeWeightSelectTrack ===
function onChangeWeightSelectTrack(type) {
        let kg = $('#s_kg_weight').val()
        let gram = $('#s_gram_weight').val()
        if(type == 1){
            $('#s_gram_weight').val(kg*1000)
            $('#s_weight').val(kg*1000)
        }else{
            if(gram !== 0 && gram !== ''){
                $('#s_kg_weight').val(gram/1000)
                $('#s_weight').val(gram)
            }else{
                $('#s_kg_weight').val(0)
                $('#s_weight').val(0)
            }
        }
    }


// === loadTrackingApiTable ===
function loadTrackingApiTable() {
        let customer_id = $('#customer_id').val()
        $('#trackingApiTable').DataTable({
            processing: true,
            serverSide: true,
            searching: false,
            destroy:true,
            ajax: "/order/getdt-tracking-api-list/"+customer_id,
            columns: [
                {
                    "data":"checkbox",
                    orderable: false, 
                    searchable: false

                },
                {
                    "data":"track_no",
                    "name":"shippings.track_no",
                },
                {
                    "data":"dst_name",
                    "name":"shippings.dst_name",
                },
                {
                    "data":"dst_phone",
                    "name":"shippings.dst_phone",
                },
                {
                    "data":"cod_amount",
                    "name":"shippings.cod_amount",
                },
                {
                    "data":"remark",
                    "name":"shippings.remark",
                },
                
                {
                    "data":"action",
                    "name":"action",
                },
            ]
        });
    }


// === selectTrackTable ===
function selectTrackTable(tracking) {
        $('#tracking_input').val(tracking);
        searchTrackingApi()
    }


// === selectCheckboxItem ===
function selectCheckboxItem(id) {
        orders = [];
        $.each($("input[name='orders']:checked"), function(){
            let new_val = parseInt($(this).val())
            orders.push(new_val);
        });
    }


// === changeColor ===
function changeColor(id) {
        $(`.pd_other_color_${id}`).val('')
        if ($(`#pd_color_${id}`).val() == 'other'){
            $(`#collapseOtherColor_${id}`).collapse('show')
        }else{
            $(`#collapseOtherColor_${id}`).collapse('hide')
        } 
    }


// === calculateDiscount ===
function calculateDiscount() {
        let total_amount = $('#total').val()
        let discount_value = $('#discount_value').val()
        let discount_type = $('#discount_type').val()
        let new_total_amount = total_amount
        let percent_discount = 0
        $('#discount').val(0)
        if(total_amount != 0){
            if(discount_type == 1){
                new_total_amount = parseFloat(total_amount) - parseFloat(discount_value)
                discount_value = parseFloat(discount_value)
                discount_value = discount_value.toFixed(2)
                $('#discount').val(discount_value)
            }
            if(discount_type == 2){
                percent_discount = (parseFloat(total_amount)* parseFloat(discount_value)) / 100
                new_total_amount = total_amount - percent_discount
                percent_discount = parseFloat(percent_discount)
                percent_discount = percent_discount.toFixed(2)
                $('#discount').val(percent_discount)

            }
            new_total_amount = parseFloat(new_total_amount)
            new_total_amount = new_total_amount.toFixed(2)

            $('#total_amount').val(new_total_amount)
            $('#cash').val(0.00)
            $('#change').val(0.00)
        }
    }


// === cursorChecker ===
function cursorChecker(current_key) {
    const current_index = priority.indexOf(current_key);
    let target_index = -1;

    if (current_index > 0) {
        for (let i = current_index - 1; i >= 0; i--) {
            const $input = $('input[data-key="'+priority[i]+'"]');
            if (!$input.val()) {
                target_index = i;
                break;
            }
        }
    }

    if (target_index == -1) {
        if (current_index + 1 < priority.length) {
            target_index = current_index + 1;
        }
    }

    if (target_index != -1) {
        const key = priority[target_index];
        const $target = $('input[data-key="'+key+'"]');

        setTimeout(() => {
            hardFocus($target);
            setActivePhoto(key);
        }, 50);
    }
}


// === selectAmount ===
function selectAmount(event) {
    let amount = Number($(event).find('.amount-value').text().replace(/,/g, ''));
    $('.amount-card').removeClass('active');
    $(event).addClass('active');
    $('#cancel-button').prop('disabled', true);
    $('#txn_id').val('');
    $('#selectPrice').modal('hide');
    $('#cover-spin').show(0);
    
       $.post('/topup/qrcode', 
            { 'amount': amount,
              '_token':'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su',
            }, 
        ).done((res) => {
            if(res.status){
                $('#txn_id').val(res.txn_id ?? res.data.txn_id);
                $('#image-qr-code').attr('src',`data:image/png;base64,${res.data.checkout_url}`);
                $('#qr-code-amount ').text(amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })+' บาท');
                setTimeout(function () {
                        $('#selectPrice').modal('hide');
                        $('.amount-card').removeClass('active');
                    }, 100);
                $('#cover-spin').hide(0);
                $('#paymentQrCode').modal('show').fadeIn(500);

            }else{
                toastr['error'](res.msg, 'ระบบแจ้งเตือน', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            }
        })

}


// === checkCallBackQrcode ===
function checkCallBackQrcode(txn_id) {
    check_xhr = $.post('/topup/check-callback-by-txn-id', {
        txn_id: txn_id,
        _token: 'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su'
    }).done(res => {
        if (res.status) {
            toastr.success(res.message, 'ระบบแจ้งเตือน');
            setTimeout(() => {
                $.get('/still-alive').done(res => {
                    $('.user-credit').text(`เครดิต : ${res.credits}`)
                });
            }, 3000);

        } else {
            toastr.warning(res.message, 'ระบบแจ้งเตือน');
        }

        $('#paymentQrCode').modal('hide');
    })
    .fail(() => {
        Swal.fire('ผิดพลาด', 'ไม่สามารถตรวจสอบรายการได้', 'error');
        $('#paymentQrCode').modal('hide');
    })
    .always(() => {
        checking_payment = false;
        check_xhr = null;

        $('.confirm-transfer')
            .prop('disabled', false)
            .find('.btn-text').removeClass('d-none')
            .end()
            .find('.btn-loading').addClass('d-none');

        $('.change-price').prop('disabled', false);
        $('#qr-code-loading').addClass('d-none');
    });
}


// === checkApprovePolicies ===
function checkApprovePolicies(){
        if (approve_policies == 0) {
            let app_name = $('#app_name').val()
            if(app_name == 'DPlus'){
                $('#policiesModal').modal('show')
            }
        }
        loadNew()
    }


// === onExchangePoint ===
function onExchangePoint() {
            Swal.fire({
                title: 'ข้อความจากระบบ',
                text: 'คุณต้องการแลกคะแนนเป็นเครดิตใช่หรือไม่?',
                icon: 'warning',
                showDenyButton: true,
                confirmButtonText: 'ตกลง',
                denyButtonText: 'ยกเลิก',
                allowOutsideClick: false
            })
            .then((result) => {
                if (result.isConfirmed) {
                    $.get('/exchange-point').done(res => {
                        if(res.status){
                            toastr['success'](res.message, 'ข้อความจากระบบ', {
                                closeButton: true,
                                tapToDismiss: false,
                                rtl: isRtl
                            });
                            $('.user-point').text('แลกคะแนน 0.00')
                        }else{
                            toastr['error'](res.message, 'ข้อความจากระบบ', {
                                closeButton: true,
                                tapToDismiss: false,
                                rtl: isRtl
                            });
                            return
                        }
                    })
                }
            });
           
        }
