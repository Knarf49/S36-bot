

// === INLINE SCRIPT 0 ===

document.addEventListener("DOMContentLoaded", function() {
    const activeMenu = document.querySelector('.active-menu');
    if (activeMenu) {
        // เปิด collapse ถ้ามี
        const parentCollapse = activeMenu.closest('.collapse.menu-dropdown');
        if (parentCollapse) {
            parentCollapse.classList.add('show');
        }
        // scroll ไปที่เมนู
        activeMenu.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
});



// === INLINE SCRIPT 1 ===

$('.price-filter').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const data = $(this).data('filter');
    const text = $(this).text().trim();
    const dropdown = $(this).closest('.dropdown');
    dropdown.addClass('disable-hover');

    $('#filterMenuButton').dropdown('hide');
    $('#filter-text').addClass((text == 'cost') ? 'text-warning' : 'asd').text(text);
 
    comparePrice(data);

    setTimeout(() => {
        dropdown.removeClass('disable-hover');
    }, 200);
});




// === INLINE SCRIPT 2 ===
document.write(new Date().getFullYear())


// === INLINE SCRIPT 3 ===

    let isRtl = $('html').attr('data-textdirection') === 'rtl',
        typeSuccess = $('#type-success'),
        clearToastObj;
    let lock_pacel = 0; //if = 1 is locked
    let has_label_info = 0; //if = 1 has label info
    let check_label_info = 0; //if = 1 has label info
    let has_dst_info = 0; //if = 1 has dst info
    let has_track_info = 0; //if = 1 has dst info
    let check_dst_info = 0; //if = 1 has dst info
    let input_src = document.querySelector('#label_search_keyword')
    let input_dst = document.querySelector('#dst_search_keyword')
    let credit = 282.46
    let new_customer_id  = 0;
    var userText = $('#paperangLink');
    let lock_dst = 0;
    let print_size = '';
    let save_print = 0;
    let user_camera = 0;
    let user_camera_device = '';
    let current_photo_key = null;
    var camera_zoom = 1;
    var camera_timer_seconds = 5;
    var config_camera = null;
    var show_images = false;
    var topup_qrcode = true;
    
    // copy text on click
    function onCopyLink() {
        userText.select();
        document.execCommand('copy');
        toastr['success']('คัดลอกลิงค์สำเร็จ นำลิงค์ไปเปิดในแอพ Paperang เพื่อปริ้นได้เลย', 'ข้อความจากระบบ', {
            closeButton: true,
            tapToDismiss: false,
            rtl: isRtl
        });

    };
    // enter search member
    if (input_src) {
        input_src.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                let button_search1 = document.getElementById("button_search1");
                if (button_search1) {
                    button_search1.click();
                }
            }
        });
    }

    if (input_dst) {
        input_dst.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                let button_search2 = document.getElementById("button_search2");
                if (button_search2) {
                    button_search2.click();
                }
            }
        });
    }
    // end enter search member
    $('.close').on('click',function(){
        $('.modal').modal('hide')
    })

    $(function () {
        $('[data-bs-toggle="popover"]').each(function () {
            new bootstrap.Popover(this)
        });
    });

    $(document).ready(() => {
        checkPrimaryAddress()
        checkCartAddress()
        calculateSummary()
        loadCartLogs()
        checkPacel()
        let app = 'TwentyExpress'

        $("#thailand_keyword").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#search_result_dst").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#label_phone").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#dst_phone").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#dst_zipcode").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#label_phone").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#account_number").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        // $("#branch_no").on('input', function(e) {
        //     $(this).val($(this).val().replace(/[^0-9]/g, ''));
        // });

        $("#label_zipcode").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#gram_weight").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        
        $("#s_gram_weight").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        }); 

        $("#label_search_keyword").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#dst_search_keyword").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        // $("#cash").on('input', function(e) {
        //     $(this).val($(this).val().replace(/[^0-9]/g, ''));
        // });
        $("#width").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        $("#length").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });   
        $("#height").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        $("#pd_weight").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        $("#pd_width").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        $("#pd_length").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });   
        $("#pd_height").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });
        $("#pd_price").on('input', function(e) {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        if(app != 'SuperShip'){
            $('#width').val(14)
            $('#length').val(20)
            $('#height').val(6)
        }
        let courier_code = $('#courier_code').val()
        if (courier_code === 'JntExpress' || courier_code === 'JntBangkok'){
            $('#jnt-pickup-class').removeClass('d-none')
        }
    });
    $('#is_branchx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#collapseBranch').collapse("show")
            $('#is_company').val(1)
        } else {
            $('#collapseBranch').collapse("hide")
            $('#is_company').val(0)
        }
    })
    $('#invoice_checkbox').on('change',function(){
        if ($(this).is(':checked')) {
            $('#is_invoice').val(1)
        } else {
            $('#collapseBranch').collapse("hide")
            $('#is_invoice').val(0)
        }
    })
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
    // checkPrimaryAddress()
    //     function checkPrimaryAddress(){
    //         $.get('/check-map').done(res => {
    //             if(!res.status){
    //                 Swal.fire({
    //                     title: 'ข้อความจากระบบ',
    //                     text: 'กรุณาปักหมุดที่อยู่',
    //                     icon: 'warning',
    //                     confirmButtonText: 'ไปตั้งค่าที่อยู่',
    //                     confirmButtonColor: '#F0E75A',
    //                     allowOutsideClick: false
    //                 })
    //                 .then((result) => {
    //                     if (result.isConfirmed) {
    //                         window.location = '/address';
    //                     }
    //                 });
    //             }
                
    //         })
    //     }
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

                            // $('#bank_id').attr("disabled", true); 
                            // $('#account_name').prop('readOnly', true);
                            // $('#account_number').prop('readOnly', true);

                            // $('#branch_no').prop('readOnly', true);
                        }
                        $('#save_addressx').prop('checked', false);
                        $.get(`/order/get-tracking-api/${res.data.id}`).done((res)=>{
                                if(res.status){
                                    $('#btn_add_tracking').removeClass('d-none')
                                }
                        })
                        if(res.data.invoice_name != null){
                            $('#invoice_customer_name').val(res.data.invoice_name)
                            $('#invoice_customer_phone').val(res.data.invoice_phone)
                            $('#invoice_customer_tax_id').val(res.data.invoice_tax_id)
                            $('#invoice_customer_address').val(res.data.invoice_address)
                            $('#invoice_customer_zipcode').val(res.data.invoice_zipcode)
                            $('#invoice_customer_email').val(res.data.invoice_email)
                            if(res.data.is_company == 1){
                                $('#is_company').val(res.data.is_company)
                                $('#is_branchx').prop('checked', true);
                                $('#collapseBranch').collapse("show")
                                if(res.data.invoice_branch == 0){
                                    $('input[name="is_branch"][value="main_company"]').prop('checked', true);
                                     $('#invoice_branch').prop('disabled', true)
                                }else{
                                    $('input[name="is_branch"][value="sub_company"]').prop('checked', true);
                                    $('#invoice_branch').val(res.data.invoice_branch);
                                    $('#invoice_branch').prop('disabled', false)
                                }
                            }
                        }
                    }else{
                        has_label_info = 0; 
                    }
                })
            }
        })
    }
    // start section search label info

    $('.thailand_keyword').on('keyup',function(){
        $('.label_sub_district_search_result').empty();
        $('.label_sub_district_search_result').addClass('d-none');
        $('.label_district_search_result').empty();
        $('.label_district_search_result').addClass('d-none');
        $('.label_province_search_result').empty();
        $('.label_province_search_result').addClass('d-none');
        $('.label_zipcode_search_result').empty();
        $('.label_zipcode_search_result').addClass('d-none');
        
        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.search_result').addClass('scrollable');
                }else{
                    $('.search_result').removeClass('scrollable');
                }
                $('.search_result').empty();
                $('.search_result').addClass('d-none');
                res.map( thailand => {
                $('.search_result').removeClass('d-none');
                    $('.search_result').append(`<li class="list-group-item"  onclick="setAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.search_result').empty();
            $('.search_result').addClass('d-none');
        }
    })
    $('#label_sub_district').on('keyup',function(){
        $('.search_result').empty();
        $('.search_result').addClass('d-none');
        $('.label_district_search_result').empty();
        $('.label_district_search_result').addClass('d-none');
        $('.label_province_search_result').empty();
        $('.label_province_search_result').addClass('d-none');
        $('.label_zipcode_search_result').empty();
        $('.label_zipcode_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.label_sub_district_search_result').addClass('scrollable');
                }else{
                    $('.label_sub_district_search_result').removeClass('scrollable');
                }
                $('.label_sub_district_search_result').empty();
                $('.label_sub_district_search_result').addClass('d-none');
                res.map( thailand => {
                $('.label_sub_district_search_result').removeClass('d-none');
                    $('.label_sub_district_search_result').append(`<li class="list-group-item"  onclick="setAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.label_sub_district_search_result').empty();
            $('.label_sub_district_search_result').addClass('d-none');
        }
    })
    $('#label_district').on('keyup',function(){
        $('.search_result').empty();
        $('.search_result').addClass('d-none');
        $('.label_sub_district_search_result').empty();
        $('.label_sub_district_search_result').addClass('d-none');
        $('.label_province_search_result').empty();
        $('.label_province_search_result').addClass('d-none');
        $('.label_zipcode_search_result').empty();
        $('.label_zipcode_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.label_district_search_result').addClass('scrollable');
                }else{
                    $('.label_district_search_result').removeClass('scrollable');
                }
                $('.label_district_search_result').empty();
                $('.label_district_search_result').addClass('d-none');
                res.map( thailand => {
                $('.label_district_search_result').removeClass('d-none');
                    $('.label_district_search_result').append(`<li class="list-group-item"  onclick="setAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.label_district_search_result').empty();
            $('.label_district_search_result').addClass('d-none');
        }
    })
    $('#label_province').on('keyup',function(){
        $('.search_result').empty();
        $('.search_result').addClass('d-none');
        $('.label_sub_district_search_result').empty();
        $('.label_sub_district_search_result').addClass('d-none');
        $('.label_district_search_result').empty();
        $('.label_district_search_result').addClass('d-none');
        $('.label_zipcode_search_result').empty();
        $('.label_zipcode_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.label_province_search_result').addClass('scrollable');
                }else{
                    $('.label_province_search_result').removeClass('scrollable');
                }
                $('.label_province_search_result').empty();
                $('.label_province_search_result').addClass('d-none');
                res.map( thailand => {
                $('.label_province_search_result').removeClass('d-none');
                    $('.label_province_search_result').append(`<li class="list-group-item"  onclick="setAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.label_province_search_result').empty();
            $('.label_province_search_result').addClass('d-none');
        }
    })
    $('#label_zipcode').on('keyup',function(){
        $('.search_result').empty();
        $('.search_result').addClass('d-none');
        $('.label_sub_district_search_result').empty();
        $('.label_sub_district_search_result').addClass('d-none');
        $('.label_district_search_result').empty();
        $('.label_district_search_result').addClass('d-none');
        $('.label_province_search_result').empty();
        $('.label_province_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.label_zipcode_search_result').addClass('scrollable');
                }else{
                    $('.label_zipcode_search_result').removeClass('scrollable');
                }
                $('.label_zipcode_search_result').empty();
                $('.label_zipcode_search_result').addClass('d-none');
                res.map( thailand => {
                $('.label_zipcode_search_result').removeClass('d-none');
                    $('.label_zipcode_search_result').append(`<li class="list-group-item"  onclick="setAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.label_zipcode_search_result').empty();
            $('.label_zipcode_search_result').addClass('d-none');
        }
    })
    function setAddress(district ,amphure ,province,zipcode){
        $('.search_result').empty();
        $('.search_result').addClass('d-none');
        $('.label_sub_district_search_result').empty();
        $('.label_sub_district_search_result').addClass('d-none');
        $('.label_district_search_result').empty();
        $('.label_district_search_result').addClass('d-none');
        $('.label_province_search_result').empty();
        $('.label_province_search_result').addClass('d-none');
        $('.label_zipcode_search_result').empty();
        $('.label_zipcode_search_result').addClass('d-none');

        $('#label_sub_district').val(district);
        $('#label_district').val(amphure);
        $('#label_province').val(province);

        
        if(zipcode.length > 5){
            $('#selectZipcode').modal('show');
            zipcodes = zipcode.split(',');
            $('#multipleZipcode').empty();
            zipcodes.map(selectedzipcode => {
                $('#multipleZipcode').append(
                `<a href="javascript:void(0);" class="card" style="margin-bottom: 0 !important;" onclick="setZipcode('${district}','${amphure}','${province}',${selectedzipcode})">
                    <div class="card-body">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1 text-bold"><strong>${selectedzipcode}</strong></h5>
                        </div>
                        <p class="mb-1">${district} ${amphure} ${province}</p>
                    </div>
                </a>`
                );
            });
        }else{
            $('#label_zipcode').val(zipcode);
            $('.thailand_keyword').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
            toastr['success']('เลือกรายการสำเร็จ', 'ที่อยู่', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('.thailand_keyword').prop('readonly', true);
        }
    }
    function setZipcode(district ,amphure ,province,zipcode){
        $('#selectZipcode').modal('hide');
        $('#label_zipcode').val(zipcode);
        $('.thailand_keyword').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
        toastr['success']('เลือกรายการสำเร็จ', 'ที่อยู่', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
        $('.thailand_keyword').prop('readonly', true);
    }
    function searchCustomer() {
        if(has_label_info == 1){
            Swal.fire({
                title:'มีรายการค้างอยู่?',
                text:'คุณมีรายการค้างอยู่ต้องการสิ้นสุดรายการใช่หรือไม่',
                icon:'question',
                showCancelButton:true,
                cancelButtonText:'ไม่,สร้างรายการต่อ',
                confirmButtonText:'ใช่,สิ้นสุดเลย'
            }).then((itok)=>{
                if(itok.isConfirmed){
                    let total_amount = $('#total_amount').val()
                    $('#cash').val(total_amount)
                    $('#change').val(0)
                    calculateSummary()
                    createDropoff('print','80mm')
                }else{
                    return false
                }
            })
        }
        let keyword = $('#label_search_keyword').val();
        let address_id = $('#address_id').val();
        $.get(`/address/search-customer`,{'keyword':keyword,'address_id':address_id}).done((res)=>{
            if(res.status){
                // has_label_info = 1; 
                toastr['success']('ค้นหาผู้ส่งสำเร็จ', 'ค้นหาผู้ส่ง', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                $('#customer_id').val(res.data.id)
                $('#label_name').val(res.data.name)
                $('#label_phone').val(res.data.phone)
                if(res.data.card_id != null && res.data.card_id != 'null' && res.data.card_id != 'undefined' ){
                        $('#card_id').val(res.data.card_id)
                    }
                $('#label_address').val(res.data.address.address)
                $('#label_sub_district').val(res.data.address.sub_district)
                $('#label_district').val(res.data.address.district)
                $('#label_province').val(res.data.address.province)
                $('#label_zipcode').val(res.data.address.zipcode)
                $('.thailand_keyword').val(`${res.data.address.sub_district} » ${res.data.address.district} » ${res.data.address.province} » ${res.data.address.zipcode}`)
                
                if(res.data.bank_id !== null || res.data.account_name !== null || res.data.account_number !== null  ){
                    $('#accountCollapse').collapse('show')
                    $('.btn-add-account').addClass('d-none')
                    $('#bank_id').val(res.data.bank_id).change()
                    $('#account_name').val(res.data.account_name)
                    $('#account_number').val(res.data.account_number)
                    // $('#branch_no').val(res.data.branch_no)
                    // $('#save_addressx').prop('checked', false);

                    // $('#bank_id').attr("disabled", true); 
                    // $('#account_name').prop('readOnly', true);
                    // $('#account_number').prop('readOnly', true);
                    // $('#branch_no').prop('readOnly', true);
                }else{
                    $('#accountCollapse').collapse('hide')
                    $('.btn-add-account').removeClass('d-none')
                    $('#bank_id').val('').change()
                    $('#account_name').val('')
                    $('#account_number').val('')
                    // $('#branch_no').val('')
                    $('#save_addressx').prop('checked', false);
                }
                if(res.data.invoice_name != null){
                    $('#invoice_customer_name').val(res.data.invoice_name)
                    $('#invoice_customer_phone').val(res.data.invoice_phone)
                    $('#invoice_customer_tax_id').val(res.data.invoice_tax_id)
                    $('#invoice_customer_address').val(res.data.invoice_address)
                    $('#invoice_customer_zipcode').val(res.data.invoice_zipcode)
                    $('#invoice_customer_email').val(res.data.invoice_email)
                    if(res.data.is_company == 1){
                        $('#is_company').val(res.data.is_company)
                        $('#is_branchx').prop('checked', true);
                        $('#collapseBranch').collapse("show")
                        if(res.data.invoice_branch == 0){
                            $('input[name="is_branch"][value="main_company"]').prop('checked', true);
                        }else{
                            $('input[name="is_branch"][value="sub_company"]').prop('checked', true);
                            $('#invoice_branch').val(res.data.invoice_branch);
                        }
                    }
                }
            $.get(`/order/get-tracking-api/${res.data.id}`).done((res)=>{
                    if(res.status){
                        $('#btn_add_tracking').removeClass('d-none')
                    }
            })
            }else{
                has_label_info = 0; 
                $('#label_phone').val(keyword)
                if(search_label_address_world == 0){
                    toastr['error']('ไม่พบข้อมูล', 'ค้นหาผู้ส่ง', {
                        closeButton: true,
                        tapToDismiss: false,
                        rtl: isRtl
                    });
                }
            }
        })
    }
    // end section search label info

    // start section search dst info
    $('#dst_sub_district').on('keyup',function(){
        $('.dst_search_result').empty();
        $('.dst_search_result').addClass('d-none');
        $('.dst_zipcode_search_result').empty();
        $('.dst_zipcode_search_result').addClass('d-none');
        $('.dst_province_search_result').empty();
        $('.dst_province_search_result').addClass('d-none');
        $('.dst_district_search_result').empty();
        $('.dst_district_search_result').addClass('d-none');
        
        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_sub_district_search_result').addClass('scrollable');
                }else{
                    $('.dst_sub_district_search_result').removeClass('scrollable');
                }
                $('.dst_sub_district_search_result').empty();
                $('.dst_sub_district_search_result').addClass('d-none');
                res.map( thailand => {
                $('.dst_sub_district_search_result').removeClass('d-none');
                    $('.dst_sub_district_search_result').append(`<li class="list-group-item"  onclick="setDstAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.dst_sub_district_search_result').empty();
            $('.dst_sub_district_search_result').addClass('d-none');
        }
    })
    $('#dst_district').on('keyup',function(){
        $('.dst_search_result').empty();
        $('.dst_search_result').addClass('d-none');
        $('.dst_zipcode_search_result').empty();
        $('.dst_zipcode_search_result').addClass('d-none');
        $('.dst_province_search_result').empty();
        $('.dst_province_search_result').addClass('d-none');
        $('.dst_sub_district_search_result').empty();
        $('.dst_sub_district_search_result').addClass('d-none');


        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_district_search_result').addClass('scrollable');
                }else{
                    $('.dst_district_search_result').removeClass('scrollable');
                }
                $('.dst_district_search_result').empty();
                $('.dst_district_search_result').addClass('d-none');
                res.map( thailand => {
                $('.dst_district_search_result').removeClass('d-none');
                    $('.dst_district_search_result').append(`<li class="list-group-item"  onclick="setDstAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.dst_district_search_result').empty();
            $('.dst_district_search_result').addClass('d-none');
        }
    })
    $('#dst_province').on('keyup',function(){
        $('.dst_search_result').empty();
        $('.dst_search_result').addClass('d-none');
        $('.dst_zipcode_search_result').empty();
        $('.dst_zipcode_search_result').addClass('d-none');
        $('.dst_district_search_result').empty();
        $('.dst_district_search_result').addClass('d-none');
        $('.dst_sub_district_search_result').empty();
        $('.dst_sub_district_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_province_search_result').addClass('scrollable');
                }else{
                    $('.dst_province_search_result').removeClass('scrollable');
                }
                $('.dst_province_search_result').empty();
                $('.dst_province_search_result').addClass('d-none');
                res.map( thailand => {
                $('.dst_province_search_result').removeClass('d-none');
                    $('.dst_province_search_result').append(`<li class="list-group-item"  onclick="setDstAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.dst_province_search_result').empty();
            $('.dst_province_search_result').addClass('d-none');
        }
    })
    $('body').on('click',function(){
        $('.list-group-item').empty();
        $('.list-group-item').addClass('d-none');
    })

    $('#dst_zipcode').on('keyup',function(){
        $('.dst_search_result').empty();
        $('.dst_search_result').addClass('d-none');
        $('.dst_province_search_result').empty();
        $('.dst_province_search_result').addClass('d-none');
        $('.dst_district_search_result').empty();
        $('.dst_district_search_result').addClass('d-none');
        $('.dst_sub_district_search_result').empty();
        $('.dst_sub_district_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_zipcode_search_result').addClass('scrollable');
                }else{
                    $('.dst_zipcode_search_result').removeClass('scrollable');
                }
                $('.dst_zipcode_search_result').empty();
                $('.dst_zipcode_search_result').addClass('d-none');
                res.map( thailand => {
                $('.dst_zipcode_search_result').removeClass('d-none');
                    $('.dst_zipcode_search_result').append(`<li class="list-group-item"  onclick="setDstAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.dst_zipcode_search_result').empty();
            $('.dst_zipcode_search_result').addClass('d-none');
        }
    })
    $('.search_result_dst').on('keyup',function(){
        $('.dst_zipcode_search_result').empty();
        $('.dst_zipcode_search_result').addClass('d-none');
        $('.dst_province_search_result').empty();
        $('.dst_province_search_result').addClass('d-none');
        $('.dst_district_search_result').empty();
        $('.dst_district_search_result').addClass('d-none');
        $('.dst_sub_district_search_result').empty();
        $('.dst_sub_district_search_result').addClass('d-none');

        if(this.value != ''){
            $.get(`/search-address?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_search_result').addClass('scrollable');
                }else{
                    $('.dst_search_result').removeClass('scrollable');
                }
                $('.dst_search_result').empty();
                $('.dst_search_result').addClass('d-none');
                res.map( thailand => {
                $('.dst_search_result').removeClass('d-none');
                    $('.dst_search_result').append(`<li class="list-group-item"  onclick="setDstAddress('${thailand.district}','${thailand.amphure}','${thailand.province}','${thailand.zipcode.replace('\'','')}')">${thailand.district} » ${thailand.amphure} » ${thailand.province} » ${thailand.zipcode.replace('\'','')}</li>`)
                })
            });
        }else{
            $('.dst_search_result').empty();
            $('.dst_search_result').addClass('d-none');
        }
    })
    function setDstAddress(district ,amphure ,province,zipcode){
        $('.dst_search_result').empty();
        $('.dst_search_result').addClass('d-none');
        $('.dst_zipcode_search_result').empty();
        $('.dst_zipcode_search_result').addClass('d-none');
        $('.dst_province_search_result').empty();
        $('.dst_province_search_result').addClass('d-none');
        $('.dst_district_search_result').empty();
        $('.dst_district_search_result').addClass('d-none');
        $('.dst_sub_district_search_result').empty();
        $('.dst_sub_district_search_result').addClass('d-none');

        $('#dst_sub_district').val(district);
        $('#dst_district').val(amphure);
        $('#dst_province').val(province);

        if(zipcode.length > 5){
            $('#selectZipcodeDst').modal('show');
            zipcodes = zipcode.split(',');
            $('#multipleZipcodeDst').empty();
            zipcodes.map(selectedzipcode => {
                $('#multipleZipcodeDst').append(
                    `<a href="javascript:void(0);" class="card" style="margin-bottom: 0 !important;" onclick="setDstZipcode('${district}','${amphure}','${province}',${selectedzipcode})">
                        <div class="card-body">
                            <div class="d-flex w-100 justify-content-between">
                                <h5 class="mb-1 text-bold"><strong>${selectedzipcode}</strong></h5>
                            </div>
                            <p class="mb-1">${district} ${amphure} ${province}</p>
                        </div>
                    </a>`
                    );
            });
        }else{
            $('#dst_zipcode').val(zipcode);
  
            if ([district, amphure, province, zipcode].every(v => v)) {
                $('.search_result_dst').prop('disabled', true);
                $('.search_result_dst').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
                toastr['success']('เลือกรายการสำเร็จ', 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            }else{
                toastr['warning']('ข้อมูลไม่ครบถ้วนกรุณากรอกข้อมูลให้ครบ', 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                return
            }
    
            // $('.search_result_dst').prop('disabled', true);
        }
        checkPacel()

    }
    function setDstZipcode(district ,amphure ,province,zipcode){
        $('#selectZipcodeDst').modal('hide');
        $('#dst_zipcode').val(zipcode);
                // toastr['success']('เลือกรายการสำเร็จ', 'ที่อยู่', {
                //     closeButton: true,
                //     tapToDismiss: false,
                //     rtl: isRtl
                // });
            if ([district, amphure, province, zipcode].every(v => v)) {
                $('.search_result_dst').prop('disabled', true);
                $('.search_result_dst').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
                toastr['success']('เลือกรายการสำเร็จ', 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            }else{
                toastr['warning']('ข้อมูลไม่ครบถ้วนกรุณากรอกข้อมูลให้ครบ', 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                return
            
            }
            // $('.search_result_dst').prop('disabled', true);
            checkPacel()

    }
    function searchDestination(phone) {
        let keyword = $('#dst_search_keyword').val();
        has_dst_info = 0;
        $('#dst_phone').val(keyword)

        $.get(`/search-dst?keyword=${keyword}`).done((res)=>{
            if(!res){
                toastr['error']('ไม่พบข้อมูล', 'ค้นหาผู้รับ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            }
            if(res.length > 10){
                $('.dst_info_search_result').addClass('scrollable');
            }else{
                $('.dst_info_search_result').removeClass('scrollable');
            }
            if(res.length < 1){
                toastr['error']('ไม่พบข้อมูล', 'ค้นหาผู้รับ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            }else{
                if(search_dst_address_world == 0){
                    res.map( item => {
                    $('.dst_info_search_result').removeClass('d-none');
                        $('.dst_info_search_result').append(`<li class="list-group-item" onclick="setDstSearch('${item.phone}','${item.name}','${item.address}','${item.district}','${item.amphure}','${item.province}','${item.zipcode}')">${item.name} » (${item.phone}) » ${item.address} ${item.district} ${item.amphure} ${item.province} ${item.zipcode}</li>`)
                    })
                }
            }
        });
    }
    // end section search dst info

    // start section event pacel
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
    function onLockPacel() {
        if(lock_pacel == 0){
            lock_pacel = 1;
            $('.btn-lock-pacel').removeClass('btn-outline-secondary')
            $('.btn-lock-pacel').addClass('btn-secondary')
            $('#text-btn-lock-pacel').text('เลิกจำข้อมูลพัสดุ')
        }else{
            lock_pacel = 0;
            $('.btn-lock-pacel').addClass('btn-outline-secondary')
            $('.btn-lock-pacel').removeClass('btn-secondary')
            $('#text-btn-lock-pacel').text('จำข้อมูลพัสดุ')
 
        }
    }
    $('#box_id').on('change',function(){
        let box_id = $('#box_id').val();
        $.get(`/boxes/${box_id}`).done((res)=>{
            if(res.status){
                $('#width').val(res.data.width);
                $('#length').val(res.data.length);
                $('#height').val(res.data.height);
                checkPacel()
            }
        })

    })
    // end section event pacel
    $('#width').on('keyup', function(e) {
        checkPacel()
    });

    $('#length').on('keyup', function(e) {
        checkPacel()
    });

    $('#height').on('keyup', function(e) {
        checkPacel()
    });
    $('#kg_weight').on('keyup', function(e) {
        checkPacel()
    });
    $('#gram_weight').on('keyup', function(e) {
        checkPacel()
    });

    $('#category_id').on('change', function(e) {
        checkPacel()
    });
    $('#courier_code').on('change', function(e) {
        checkPacel()
        checkOptionCourierCode(this);
    });
    $('#dst_sub_district').on('change', function(e) {
        checkPacel()
    });
    $('#dst_district').on('change', function(e) {
        checkPacel()
    });
    $('#dst_province').on('change', function(e) {
        checkPacel()
    });
    $('#dst_zipcode').on('change', function(e) {
        checkPacel()
    });
    $('#dst_name').on('change', function(e) {
        checkPacel()
    });
    $('#dst_address').on('change', function(e) {
        checkPacel()
    });
    $('#dst_phone').on('change', function(e) {
        checkPacel()
    });
    $('#cod_amount').on('change', function(e) {
        checkPacel()
        let cod_amount = $('#cod_amount').val()
        $('.text-cod-insurance').addClass('d-none')
        if(cod_amount > 2000){
            let is_insuranced = $('#is_insuranced').val()
            if(is_insuranced == 'yes'){
                $('.text-cod-insurance').removeClass('d-none')
                Swal.fire({
                    title:'คุณต้องการซื้อประกันสินค้าหรือไม่?',
                    text:'การซื้อประกันเป็นการเพิ่มวงเงิน หากไม่แน่ใจว่าสินค้าเข้าเงื่อนไขหรือไม่ ให้ติดต่อแอดมินก่อนทำรายการ',
                    // icon:'question',
                    iconHtml: `<img src="../../assets/images/icons/shield.gif" style="width:100%">`,
                    // customClass: {
                    //     icon: 'rotate-y',
                    // },
                    showCancelButton:true,
                    cancelButtonText:'ไม่เป็นไร,​ขอบคุณ',
                    confirmButtonText:'ใช่,ซื้อประกันเลย'
                }).then((itok)=>{
                    if(itok.isConfirmed){
                        $('#insurance_x').prop('checked', true);
                        $('#is_insured').val(1);
                        $('#divInsurance').removeClass('d-none')
                        $('#collapseInsurance').collapse('show')
                        $('#product_value').val('').val(cod_amount).trigger('change')
                    }
                })
            }
        }
        
    });
    $('#product_value').on('change', function(e) {
        checkPacel()
    });
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

    function checkOptionCourierCode(element)
    {
        ($(element).val() == 'DPTHAIPOST') ? $('#thai_post_alert').removeClass('d-none') :  $('#thai_post_alert').addClass('d-none');
    }

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
        //     $('#txt_total_price').text(0)
        //     $('#total_price').val(0)

        //     return false;
        // }


        if(courier_code !== 'NoCourier'){
            $.get(`/check-courier`,{
                'courier_code':courier_code
            }).done((res)=>{
                    $('#btn-save-order').prop('disabled', false)
                    $('.btn-save-print-order').removeClass('disabled')
                    $('#category_id').attr('disabled',false);
                    $('#category_id').val('non')

                    let categories = [{"id":0,"name":"\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23","name_en":"File","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":1,"name":"\u0e2d\u0e32\u0e2b\u0e32\u0e23\u0e41\u0e2b\u0e49\u0e07","name_en":"Dry food","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":2,"name":"\u0e02\u0e2d\u0e07\u0e43\u0e0a\u0e49","name_en":"Commodity","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":3,"name":"\u0e2d\u0e38\u0e1b\u0e01\u0e23\u0e13\u0e4c\u0e44\u0e2d\u0e17\u0e35","name_en":"Digital Products","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":4,"name":"\u0e40\u0e2a\u0e37\u0e49\u0e2d\u0e1c\u0e49\u0e32","name_en":"Clothes","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":5,"name":"\u0e2a\u0e37\u0e48\u0e2d\u0e1a\u0e31\u0e19\u0e40\u0e17\u0e34\u0e07","name_en":"Books","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:17.000000Z","updated_at":"2021-05-13T09:38:17.000000Z"},{"id":6,"name":"\u0e2d\u0e30\u0e44\u0e2b\u0e25\u0e48\u0e23\u0e16\u0e22\u0e19\u0e15\u0e4c","name_en":"Auto parts","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":7,"name":"\u0e23\u0e2d\u0e07\u0e40\u0e17\u0e49\u0e32\/\u0e01\u0e23\u0e30\u0e40\u0e1b\u0e4b\u0e32","name_en":"Shoes and bags","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":8,"name":"\u0e2d\u0e38\u0e1b\u0e01\u0e23\u0e13\u0e4c\u0e01\u0e35\u0e2c\u0e32","name_en":"Sports equipment","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":9,"name":"\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e2a\u0e33\u0e2d\u0e32\u0e07\u0e04\u0e4c","name_en":"Cosmetics","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":10,"name":"\u0e40\u0e1f\u0e2d\u0e23\u0e4c\u0e19\u0e34\u0e40\u0e08\u0e2d\u0e23\u0e4c","name_en":"Household","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":11,"name":"\u0e1c\u0e25\u0e44\u0e21\u0e49","name_en":"Fruit","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"},{"id":99,"name":"\u0e2d\u0e37\u0e48\u0e19\u0e46","name_en":"Others","status":1,"base_prices":30,"created_at":"2021-05-13T09:38:18.000000Z","updated_at":"2021-05-13T09:38:18.000000Z"}]
                    let ct = '<option value="non">กรุณาเลือกประเภทพัสดุ</option>'
                    let content = ct
                    $('#category_id').empty()
   
                    if(res.is_fruit != 1){
                        categories = categories.filter(item => item.id != 11)
                        categories.map(item => {
                            if(category_id == item.id){
                                ct = `<option value="${item.id}" selected>${item.name}</option>`
                            }else{
                                ct = `<option value="${item.id}">${item.name}</option>`
                            }
                            content = content+ ct;
                        })
                        $('#category_id').append(content)
                    }else{
                        categories.map(item => {
                            if(category_id == item.id){
                                ct = `<option value="${item.id}" selected>${item.name}</option>`
                            }else{
                                ct = `<option value="${item.id}">${item.name}</option>`
                            }
                            content = content+ ct;
                        })
                        $('#category_id').append(content)
                        if(courier_code == 'DPFLASHAFRUIT'){
                            $('#category_id').attr('disabled',true);
                            $('#category_id').val(11)
                        }
                        if(courier_code == 'DPFLASHQFRUIT'){
                            $('#category_id').attr('disabled',true);
                            $('#category_id').val(11)
                        }
                        if(courier_code == 'SPSXFLASHFRUIT'){
                            $('#category_id').attr('disabled',true);
                            $('#category_id').val(11)
                        }
                        if(courier_code == 'DPFLASHLIVEFRUIT'){
                            $('#category_id').attr('disabled',true);
                            $('#category_id').val(11)
                        }
                    }
                    if(category_id == 11 && res.is_fruit == 0){
                        $('#check_condition_pacel').text(`ขนส่งนี้ไม่เปิดบริการส่งพัสดุประเภทผลไม้`)
                        $('#check_condition_pacel').addClass('text-danger')
                        $('#txt_cost_price').text(0)
                        $('#dropoff_cost_price').val(0)
                        $('#txt_shop_price').text(0)
                        $('#dropoff_shop_price').val(0)
                        $('#txt_remote_price').text(0)
                        $('#remote_price').val(0)
                        $('#txt_total_price').text(0)
                        $('#total_price').val(0)
                        $('#cover-spin').hide(0)
                        return false
                    }
                if(courier_code === 'DPKERRYBULKY'){
                    if (weight < 30010) {
                        $('#check_condition_pacel').text(`น้ำหนักต้องมากกว่า 30,010 กรัม (30.01 kg.)`)
                        $('#check_condition_pacel').addClass('text-danger')
                        $('#txt_cost_price').text(0)
                        $('#dropoff_cost_price').val(0)
                        $('#txt_shop_price').text(0)
                        $('#dropoff_shop_price').val(0)
                        $('#txt_remote_price').text(0)
                        $('#remote_price').val(0)
                        $('#txt_total_price').text(0)
                        $('#total_price').val(0)
                        $('#txt_cost_dimension_price').text(0)
                        $('#dropoff_cost_dimension_price').val(0)
                        $('#txt_cost_remote_price').text(0)
                        $('#dropoff_cost_remote_price').val(0)
                        $('#txt_dropoff_cost_price').text(0)
                        $('.txt_cost_dimension_price').addClass('d-none')
                        $('#dropoff_cost_dimension_percent').val(0)
                        $('.txt_customer_price').addClass('d-none')
                        $('#txt_customer_price').text(0)
                        $('#dropoff_customer_price').val(0)
                        $('#btn-save-order').prop('disabled', true)
                        $('.btn-save-print-order').addClass('disabled')
                        $('#cover-spin').hide(0)
                        return false
                    }
                }
                if(category_id != 11  && weight != '' &&  width != '' &&  length != '' &&  height != '' && weight != 0&&  width != 0 &&  length != 0 &&  height != 0){
                    if(courier_code === 'FlashExpressC' || courier_code === 'FlashBulky' || courier_code === 'NinjaVanBulky' || courier_code === 'ISPNJB') {
                        if (weight < 5000) {
                            $('#check_condition_pacel').text(`น้ำหนักต้องมากกว่า 5000 กรัม (5 kg.)`)
                            $('#check_condition_pacel').addClass('text-danger')
                            $('#txt_cost_price').text(0)
                            $('#dropoff_cost_price').val(0)
                            $('#txt_shop_price').text(0)
                            $('#dropoff_shop_price').val(0)
                            $('#txt_remote_price').text(0)
                            $('#remote_price').val(0)
                            $('#txt_total_price').text(0)
                            $('#total_price').val(0)
                            $('#txt_cost_dimension_price').text(0)
                            $('#dropoff_cost_dimension_price').val(0)
                            $('#txt_cost_remote_price').text(0)
                            $('#dropoff_cost_remote_price').val(0)
                            $('#txt_dropoff_cost_price').text(0)
                            $('.txt_cost_dimension_price').addClass('d-none')
                            $('#dropoff_cost_dimension_percent').val(0)
                            $('.txt_customer_price').addClass('d-none')
                            $('#txt_customer_price').text(0)
                            $('#dropoff_customer_price').val(0)
                            $('#btn-save-order').prop('disabled', true)
                            $('.btn-save-print-order').addClass('disabled')
                            $('#cover-spin').hide(0)
                            return false
                        }
                    }
                    if (width > res.max_side || length > res.max_side || height > res.max_side) {
                        $('#check_condition_pacel').text(`แต่ละด้านต้องไม่เกิน ${res.max_side} เซนติเมตร`)
                        $('#check_condition_pacel').addClass('text-danger')
                        $('#txt_cost_price').text(0)
                        $('#dropoff_cost_price').val(0)
                        $('#txt_shop_price').text(0)
                        $('#dropoff_shop_price').val(0)
                        $('#txt_remote_price').text(0)
                        $('#remote_price').val(0)
                        $('#txt_total_price').text(0)
                        $('#total_price').val(0)
                        $('#txt_cost_dimension_price').text(0)
                        $('#dropoff_cost_dimension_price').val(0)
                        $('#txt_cost_remote_price').text(0)
                        $('#dropoff_cost_remote_price').val(0)
                        $('#txt_dropoff_cost_price').text(0)
                        $('.txt_cost_dimension_price').addClass('d-none')
                        $('#dropoff_cost_dimension_percent').val(0)
                        $('.txt_customer_price').addClass('d-none')
                        $('#txt_customer_price').text(0)
                        $('#dropoff_customer_price').val(0)
                        $('#btn-save-order').prop('disabled', true)
                        $('.btn-save-print-order').addClass('disabled')

                        $('#cover-spin').hide(0)

                        return false
                    } else if (check_parcel > res.max_dimension) {
                        $('#check_condition_pacel').text(`กว้าง + ยาว + สูง รวมกันต้องไม่เกิน ${res.max_dimension} เซนติเมตร`)
                        $('#check_condition_pacel').addClass('text-danger')
                        $('#txt_cost_price').text(0)
                        $('#dropoff_cost_price').val(0)
                        $('#txt_shop_price').text(0)
                        $('#dropoff_shop_price').val(0)
                        $('#txt_remote_price').text(0)
                        $('#remote_price').val(0)
                        $('#txt_total_price').text(0)
                        $('#total_price').val(0)
                        $('#txt_cost_dimension_price').text(0)
                        $('#dropoff_cost_dimension_price').val(0)
                        $('#txt_cost_remote_price').text(0)
                        $('#dropoff_cost_remote_price').val(0)
                        $('#txt_dropoff_cost_price').text(0)
                        $('.txt_cost_dimension_price').addClass('d-none')
                        $('#dropoff_cost_dimension_percent').val(0)
                        $('.txt_customer_price').addClass('d-none')
                        $('#txt_customer_price').text(0)
                        $('#dropoff_customer_price').val(0)
                        $('#btn-save-order').prop('disabled', true)
                        $('.btn-save-print-order').addClass('disabled')

                        $('#cover-spin').hide(0)

                        return false
                    } else if (weight > (res.max_weight *1000)) {
                        $('#check_condition_pacel').text(`น้ำหนักต้องไม่เกิน ${(res.max_weight)} กิโลกรัม`)
                        $('#check_condition_pacel').addClass('text-danger')
                        $('#txt_cost_price').text(0)
                        $('#dropoff_cost_price').val(0)
                        $('#txt_shop_price').text(0)
                        $('#dropoff_shop_price').val(0)
                        $('#txt_remote_price').text(0)
                        $('#remote_price').val(0)
                        $('#txt_total_price').text(0)
                        $('#total_price').val(0)
                        $('#txt_cost_dimension_price').text(0)
                        $('#dropoff_cost_dimension_price').val(0)
                        $('#txt_cost_remote_price').text(0)
                        $('#dropoff_cost_remote_price').val(0)
                        $('#txt_dropoff_cost_price').text(0)
                        $('.txt_cost_dimension_price').addClass('d-none')
                        $('#dropoff_cost_dimension_percent').val(0)
                        $('.txt_customer_price').addClass('d-none')
                        $('#txt_customer_price').text(0)
                        $('#dropoff_customer_price').val(0)
                        $('#cover-spin').hide(0)
                        $('#btn-save-order').prop('disabled', true)
                        $('.btn-save-print-order').addClass('disabled')

                        return false
                    }  else {
                        checkPrice(action)
                    }
                }else{
                    $.get(`/check-courier-fruit`,{
                        'courier_code':courier_code
                    }).done((res)=>{
                        if (width > res.max_side || length > res.max_side || height > res.max_side) {
                            $('#check_condition_pacel').text(`แต่ละด้านต้องไม่เกิน ${res.max_side} เซนติเมตร`)
                            $('#check_condition_pacel').addClass('text-danger')
                            $('#txt_cost_price').text(0)
                            $('#dropoff_cost_price').val(0)
                            $('#txt_shop_price').text(0)
                            $('#dropoff_shop_price').val(0)
                            $('#txt_remote_price').text(0)
                            $('#remote_price').val(0)
                            $('#txt_total_price').text(0)
                            $('#total_price').val(0)
                            $('#txt_cost_dimension_price').text(0)
                            $('#dropoff_cost_dimension_price').val(0)
                            $('#txt_cost_remote_price').text(0)
                            $('#dropoff_cost_remote_price').val(0)
                            $('#txt_dropoff_cost_price').text(0)
                            $('.txt_cost_dimension_price').addClass('d-none')
                            $('#dropoff_cost_dimension_percent').val(0)
                            $('.txt_customer_price').addClass('d-none')
                            $('#txt_customer_price').text(0)
                            $('#dropoff_customer_price').val(0)
                            $('#cover-spin').hide(0)
                            $('.btn-save-print-order').addClass('disabled')
                            $('#btn-save-order').prop('disabled', true)


                            return false
                        } else if (check_parcel > res.max_dimension) {
                            $('#check_condition_pacel').text(`กว้าง + ยาว + สูง รวมกันต้องไม่เกิน ${res.max_dimension} เซนติเมตร`)
                            $('#check_condition_pacel').addClass('text-danger')
                            $('#txt_cost_price').text(0)
                            $('#dropoff_cost_price').val(0)
                            $('#txt_shop_price').text(0)
                            $('#dropoff_shop_price').val(0)
                            $('#txt_remote_price').text(0)
                            $('#remote_price').val(0)
                            $('#txt_total_price').text(0)
                            $('#total_price').val(0)
                            $('#txt_cost_dimension_price').text(0)
                            $('#dropoff_cost_dimension_price').val(0)
                            $('#txt_cost_remote_price').text(0)
                            $('#dropoff_cost_remote_price').val(0)
                            $('#txt_dropoff_cost_price').text(0)
                            $('.txt_cost_dimension_price').addClass('d-none')
                            $('#dropoff_cost_dimension_percent').val(0)
                            $('.txt_customer_price').addClass('d-none')
                            $('#txt_customer_price').text(0)
                            $('#dropoff_customer_price').val(0)
                            $('#cover-spin').hide(0)
                            $('.btn-save-print-order').addClass('disabled')
                            $('#btn-save-order').prop('disabled', true)

                            return false
                        } else if (weight > (res.max_weight *1000)) {
                            $('#check_condition_pacel').text(`น้ำหนักต้องไม่เกิน ${(res.max_weight)} กิโลกรัม`)
                            $('#check_condition_pacel').addClass('text-danger')
                            $('#txt_cost_price').text(0)
                            $('#dropoff_cost_price').val(0)
                            $('#txt_shop_price').text(0)
                            $('#dropoff_shop_price').val(0)
                            $('#txt_remote_price').text(0)
                            $('#remote_price').val(0)
                            $('#txt_total_price').text(0)
                            $('#total_price').val(0)
                            $('#txt_cost_dimension_price').text(0)
                            $('#dropoff_cost_dimension_price').val(0)
                            $('#txt_cost_remote_price').text(0)
                            $('#dropoff_cost_remote_price').val(0)
                            $('#txt_dropoff_cost_price').text(0)
                            $('.txt_cost_dimension_price').addClass('d-none')
                            $('#dropoff_cost_dimension_percent').val(0)
                            $('.txt_customer_price').addClass('d-none')
                            $('#txt_customer_price').text(0)
                            $('#dropoff_customer_price').val(0)
                            $('.btn-save-print-order').addClass('disabled')
                            $('#btn-save-order').prop('disabled', true)

                            $('#cover-spin').hide(0)

                            return false
                        }  else {
                            checkPrice(action)
                        }
                    })
                }
       
            })
        }
    }
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
        if(weight == 0){
            return false
        }
        if(width == 0){
            return false
        }
        if(length == 0){
            return false
        }
        if(height == 0){
            return false
        }
        $.post(`/order/checkprice-v2`,formData).done((res)=>{
            if(parseFloat(res.cost) > 0 && parseFloat(res.price) > 0){
                let gas_fee = parseFloat(res.gas_fee) || 0;
                let total = (parseFloat(res.customer_price) > 0 ? parseFloat(res.customer_price) : parseFloat(res.price)) + parseFloat(res.remote != null ? res.remote : 0)  + parseFloat(res.price_cod_fee) + parseFloat(res.on_time_price) + parseFloat(res.price_insurance_fee) + parseFloat(res.price_box_shield_fee) + gas_fee;
                let total_cost = parseFloat(res.cost) + parseFloat(res.cost_remote != null ? res.cost_remote : 0) + parseFloat(res.cost_dimension_percent) + parseFloat(res.cost_cod_fee) + parseFloat(res.on_time_price) + parseFloat(res.cost_insurance_fee) + parseFloat(res.price_box_shield_fee) + gas_fee;
                let total_discount_price = parseFloat(res.discount_price) + parseFloat(res.cost_remote != null ? res.cost_remote : 0) + parseFloat(res.cost_dimension_percent) + parseFloat(res.cost_cod_fee) + parseFloat(res.on_time_price) + parseFloat(res.cost_insurance_fee) + parseFloat(res.price_box_shield_fee);
                let profit = total - total_cost;

                console.log(gas_fee);
                profit = profit.toFixed(2)
                $('.txt_cost_remote_price').removeClass('d-none')
                $('#txt_cost_price').text(numberWithCommas(res.cost))
                $('#txt_cost_remote_price').text(numberWithCommas(res.cost_remote))
                $('#dropoff_cost_remote_price').val(res.cost_remote)
                $('#txt_cost_gas').text(numberWithCommas(gas_fee))
                $('#txt_dropoff_cost_price').text(numberWithCommas(total_cost))
                $('#dropoff_cost_price').val(res.cost)
                $('#dropoff_cost_remote_percent').val(res.remote_percent)
                $('#dropoff_cost_dimension_percent').val(res.dimension_percent)
                let text_shop_price = `(คิดตามน้ำหนัก) ${res.price}`
                $('#weight_weight').val(res.weight_weight)
                $('#weight_side').val(res.weight_side)
                $('#weight_dimension').val(res.weight_dimension)
                $('#actual_price').val(res.actual_price)
                $('#actual_price_bulky').val(res.actual_price_bulky)
                $('#price_box_shield_fee').val(res.price_box_shield_fee)
         
    
                if (gas_fee > 0) {
                    console.log('if');
                    $('.txt_cost_gas').removeClass('d-none');
                    $('.txt_price_gas_fee').removeClass('d-none');
                    $('#gas_fee').val(gas_fee);
                    $('#price_gas_fee').text(gas_fee);
                } else {
                    console.log('else');
                    $('.txt_cost_gas').addClass('d-none');
                    $('.txt_price_gas_fee').addClass('d-none');
                    $('#gas_fee').val(0);
                    $('#price_gas_fee').text(0);
                }

                if(res.actual_price_bulky < res.actual_price){
                    $('#is_urgentx').prop('checked', false);
                    $('#express_category').val(1)
                    $('#divUrgent').addClass('d-none')

                }       
                if(res.discount_price != 0){
                    $('#discount_price').val(total_discount_price)
                }

                $('#txt_profit_price').text(profit)

                if(res.price_policies == 'weight'){
                     text_shop_price = `(คิดตามน้ำหนัก) ${numberWithCommas(res.price)}`
                     $('.txt_cost_remote_price').removeClass('d-none')
                     $('#txt_cost_dimension_price').text(0)
                     $('#dropoff_cost_dimension_price').val(0)
                     $('.txt_cost_dimension_price').addClass('d-none')
                }else{
                     text_shop_price = `(คิดตามขนาด) ${numberWithCommas(res.price)}`
                     $('#txt_cost_dimension_price').text(numberWithCommas(res.cost_dimension_percent))
                     $('#dropoff_cost_dimension_price').val(res.cost_dimension_percent)
                     $('.txt_cost_dimension_price').removeClass('d-none')
                }
                if(parseFloat(res.cost_remote) == 0){
                    $('.txt_cost_remote_price').addClass('d-none')
                    $('#txt_cost_remote_price').text(0)
                    $('#dropoff_cost_remote_price').val(0)
                }
                if(parseFloat(res.cost_dimension_percent) == 0){
                    $('.txt_cost_dimension_price').addClass('d-none')
                    $('#txt_cost_dimension_price').text(0)
                    $('#dropoff_cost_dimension_price').val(0)
                }
                if((res.has_customer_weight == 1 || res.has_customer_dimension == 1) && res.price !=0 && res.customer_price != 0){
                    $('.txt_customer_price').removeClass('d-none')
                    $('#txt_customer_price').text(numberWithCommas(res.customer_price))
                    $('#dropoff_customer_price').val(res.customer_price)
                }
                if(parseFloat(res.cost_cod_fee) > 0 && parseFloat(res.price_cod_fee) > 0){
                    $('.txt_cost_cod_fee').removeClass('d-none')
                    $('#txt_cost_cod_fee').text(res.cost_cod_fee)
                    $('#dropoff_cost_cod_fee').val(res.cost_cod_fee)
                    $('.txt_price_cod_fee').removeClass('d-none')
                    $('#txt_price_cod_fee').text(res.price_cod_fee)
                    $('#dropoff_price_cod_fee').val(res.price_cod_fee)
                }
                if(parseFloat(res.on_time_price) > 0){
                    $('.txt_cost_on_time').removeClass('d-none')
                    $('#txt_cost_on_time').text(res.on_time_price)
                    $('.txt_price_on_time').removeClass('d-none')
                    $('#txt_price_on_time').text(res.on_time_price)
                    $('#dropoff_on_time_price').val(res.on_time_price)
                }else{
                    $('.txt_cost_on_time').addClass('d-none')
                    $('#txt_cost_on_time').text(0)
                    $('.txt_price_on_time').addClass('d-none')
                    $('#txt_price_on_time').text(0)
                    $('#dropoff_on_time_price').val(0)
                }
                if(!res.insurance_status){
                    $('#alert_insurance').removeClass('d-none')
                    $('#alert_insurance').text(res.insurance_message)
                    $('#product_value').val(0)
                }
                if(parseFloat(res.cost_insurance_fee) > 0 && parseFloat(res.price_insurance_fee) > 0){
                    $('.txt_cost_insurance_fee').removeClass('d-none')
                    $('#txt_cost_insurance_fee').text(res.cost_insurance_fee)
                    $('#dropoff_insurance_fee_price').val(res.cost_insurance_fee)
                    $('.txt_price_insurance_fee').removeClass('d-none')
                    $('#txt_price_insurance_fee').text(res.price_insurance_fee)
                }else{
                    $('.txt_cost_insurance_fee').addClass('d-none')
                    $('#txt_cost_insurance_fee').text(0)
                    $('#dropoff_insurance_fee_price').val(0)
                    $('.txt_price_insurance_fee').addClass('d-none')
                    $('#txt_price_insurance_fee').text(0)
                }
                if(parseFloat(res.price_box_shield_fee) > 0 ){
                    
                    $('.txt_cost_box_shield').removeClass('d-none')
                    $('#txt_cost_box_shield').text(res.price_box_shield_fee)
                    $('#price_box_shield_fee').val(res.price_box_shield_fee)
                    $('.txt_price_box_shield_fee').removeClass('d-none')
                    $('#txt_price_box_shield_fee').text(res.price_box_shield_fee)

                }else{
                    $('.txt_cost_box_shield').addClass('d-none')
                    $('#txt_cost_box_shield').text(0)
                    $('#price_box_shield_fee').val(0)
                    $('.txt_price_box_shield_fee').addClass('d-none')
                    $('#txt_price_box_shield_fee').text(0)

                }

                $('#txt_shop_price').text(text_shop_price)
                $('#dropoff_shop_price').val(res.price)
                if(res.price_remote != 0){
                    $('#txt_remote_price').text(res.price_remote != null ? res.price_remote : 0)
                    $('.txt_remote_price').removeClass('d-none')
                }
                $('#remote_price').val(res.price_remote != null ? res.price_remote : 0)
                $('#txt_total_price').text(numberWithCommas(total))
                $('#total_price').val(total)
                $('#dropoff_cost_policies').val(res.cost_policies)
                $('#dropoff_shop_policies').val(res.price_policies)
                if(dst_name == '' || dst_phone == '' || dst_zipcode === '' || dst_sub_district === '' || dst_district === ''){
                    $('#txt_cost_price').text(0)
                    $('#dropoff_cost_price').val(0)
                    $('#txt_cost_remote_price').text(0)
                    $('#txt_dropoff_cost_price').text(0)
                    $('#txt_shop_price').text(0)
                    $('#dropoff_shop_price').val(0)
                    $('#txt_remote_price').text(0)
                    $('#remote_price').val(0)
                    $('#txt_total_price').text(0)
                    $('#total_price').val(0)
                    $('#txt_cost_dimension_price').text(0)
                    $('#dropoff_cost_dimension_price').val(0)
                    $('#dropoff_cost_dimension_percent').val(0)
                    $('.txt_cost_dimension_price').addClass('d-none')
                }
                if(action == 1){
                    addOrder()
                }
            }else{
                $('#txt_cost_price').text(0)
                $('#dropoff_cost_price').val(0)
                $('#txt_cost_remote_price').text(0)
                $('#txt_dropoff_cost_price').text(0)
                $('#txt_shop_price').text(0)
                $('#dropoff_shop_price').val(0)
                $('#txt_remote_price').text(0)
                $('#remote_price').val(0)
                $('#txt_total_price').text(0)
                $('#total_price').val(0)
                $('#txt_cost_dimension_price').text(0)
                $('#dropoff_cost_dimension_price').val(0)
                $('#dropoff_cost_dimension_percent').val(0)
                $('.txt_cost_dimension_price').addClass('d-none')
            }
            $('#btn-save-order').removeClass('disabled')
            $('.btn-save-print-order').removeClass('disabled')
        })
        // checkArea()
    }
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

    $('#cod_amountx').on('change',function(){
        if ($(this).is(':checked')) {
            // document.getElementById('cod_amount').focus();
            // $('#collapseCodAmount').collapse("show")
            $('#productCod').modal("show")
            // $('#cod_amount').val(0);
            $('#account_name').attr('required')
            $('#account_number').attr('required')
            $('#dst_district').attr('required')
            $('#accountCollapse').collapse("show")
            $('.btn-add-account').addClass("d-none")
            $("#save_addressx").attr("disabled", true);
            // $('#cod_amount').focus();   

        } else {
            $('#productCod').modal("hide")
            $('#cod_amount').val(0);
            
        }
        checkPacel()
    })
    $('#cod_amount').on('change',function(){
        if( $('#cod_amount').val() != '' || $('#cod_amount').val() > 0){
            $('#cod_amountx').prop('checked', true);
        }else{
            $('#cod_amountx').prop('checked',false);
        }
        checkPacel()
    })
    $('#insurance_x').on('change',function(){
        if ($(this).is(':checked')) {
            $('#product_value').focus();
            $('#is_insured').val(1);
            $('#collapseInsurance').collapse("show")
        } else {
            $('#is_insured').val(0);
            $('#product_value').val(0);
            $('#collapseInsurance').collapse("hide")

        }
        checkPacel()
    })
    $('#is_box_shieldx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#is_box_shield').val(1);
            checkPacel()
        } else {
            $('#is_box_shield').val(0);
            checkPacel()
        }
    })
    $('#is_urgentx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#express_category').val(2);
        } else {
            $('#express_category').val(1);
        }
        checkPacel()
    })
    
    $('#save_addressx').on('change',function(){
        if ($(this).is(':checked')) {
            if(has_label_info == 1){
                Swal.fire({
                    title:'มีข้อมูลผู้ส่งท่านนี้แล้ว?',
                    text:'ต้องการบันทึกที่อยู่ผู้ส่งใช่หรือไม่',
                    icon:'question',
                    showCancelButton:true,
                    cancelButtonText:'ยกเลิก',
                    confirmButtonText:'ใช่,บันทึกเลย'
                }).then((itok)=>{
                    if(itok.isConfirmed){
                        //  บันทึกข้อมูลผู้ส่ง
                    }
                })
            }
        } 
    })
    // $('#jnt_pickupx').on('change',function(){
    //     if ($(this).is(':checked')) {
    //         $('#jnt_pickup').val(1);
    //     }else{
    //         $('#jnt_pickup').val(6);
    //     }
    // })
    $('#save_dst_addressx').on('change',function(){
        if ($(this).is(':checked')) {
            if(has_dst_info == 1){
                Swal.fire({
                    title:'มีข้อมูลผู้รับท่านนี้แล้ว?',
                    text:'ต้องการบันทึกที่อยู่ผู้รับใช่หรือไม่',
                    icon:'question',
                    showCancelButton:true,
                    cancelButtonText:'ยกเลิก',
                    confirmButtonText:'ใช่,บันทึกเลย'
                }).then((itok)=>{
                    if(itok.isConfirmed){
                        //  บันทึกข้อมูลผู้รับ
                    }
                })
            }
        }
    })

    $('#is_branchx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#collapseBranch').collapse("show")
            $('#is_company').val(1)
        } else {
            $('#collapseBranch').collapse("hide")
            $('#is_company').val(0)
        }
    })
    $('#is_vatx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#is_vat').val(1)
        } else {
            $('#is_vat').val(0)
        }
        calculateSummary()
    })
    $('#on_holdingx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#on_holding').val(1)
            $('.holding-div').removeClass('d-none')
        } else {
            $('#on_holding').val(0)
            $('.holding-div').addClass('d-none')
        }
        calculateSummary()
    })
    $('#save_addressx').on('change',function(){
        if ($(this).is(':checked')) {
            $('#save_address').val(1)
        } else {
            $('#save_address').val(0)
        }
    })
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
    $('#product_value').on('change', function(){
        let product_value = $('#product_value').val()
        if(product_value <= 2000){
            toastr['error']('ซื้อประกันสินค้ามูลค่า 2,000 บาทขึ้นไป', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
        }
    })
    $('#cod_amount').on('change', function(){
        let cod_amount = $('#cod_amount').val()
        let bank_id = $('#bank_id').val()
        let account_name = $('#account_name').val()
        let account_number = $('#account_number').val()
        // let branch_no = $('#branch_no').val()
        if(cod_amount > 0 && cod_amount >= 30){
            if(bank_id == 0 || account_name == '' || account_number == '' ){
                toastr['error']('กรุณากรอกข้อมูลบัญชี', 'ข้อมูลบัญชี', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                $('html, body').animate({
                    scrollTop: $("#accountCollapse").position().top
                }, 200);
                $('#cover-spin').hide(0)

                return false;

            }
        }else if (cod_amount < 30) {
            toastr['error']('ยอกเก็บเงินปลายทางขั้นต่ำ 30 บาท', 'เก็บเงินปลายทาง', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
            $('#cod_amount').val(0);
            $('#cover-spin').hide(0)

        }

        checkPacel()
    })
    function createOrderForm() {
        $('#btn-save-order').addClass('disabled')
        if ($('#courier_code').val() == 'NoCourier') {
            toastr['error']('กรุณาเลือกขนส่ง', 'ขนส่ง', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false
        }
        checkPacel(1)
    }

    $('#createOrderForm').on('submit',function (e) {
        e.preventDefault();
        $('#cover-spin').show(0)
        createOrderForm()
    })
    async function addOrder() {
        let check_credit
        $('#cover-spin').show(0)
        if($('#cod_amount').val() > 0){
            if($('#bank_id').val() != 0){
                if($('#account_name').val() == '' || $('#account_number').val() == ''){
                        toastr['error']('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน', 'ข้อมูลบัญชี', {
                        closeButton: true,
                        tapToDismiss: false,
                        rtl: isRtl
                    });
                    $('html, body').animate({
                        scrollTop: $("#accountCollapse").position().top
                    }, 200);
                    $('#cover-spin').hide(0)
                    return false;
                }
            }

            if($('#account_name').val() != ''){
                if($('#bank_id').val() == 0 || $('#account_number').val() == ''){
                        toastr['error']('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน', 'ข้อมูลบัญชี', {
                        closeButton: true,
                        tapToDismiss: false,
                        rtl: isRtl
                    });
                    $('html, body').animate({
                        scrollTop: $("#accountCollapse").position().top
                    }, 200);
                    $('#cover-spin').hide(0)
                    return false;

                }
            }
            if($('#account_number').val() != ''){
                if($('#bank_id').val() == 0 || $('#account_name').val() == ''){
                        toastr['error']('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน', 'ข้อมูลบัญชี', {
                        closeButton: true,
                        tapToDismiss: false,
                        rtl: isRtl
                    });
                    $('html, body').animate({
                        scrollTop: $("#accountCollapse").position().top
                    }, 200);
                    $('#cover-spin').hide(0)
                    return false;

                }
            }
            // if($('#branch_no').val() != ''){
            //     if($('#bank_id').val() == 0 || $('#account_name').val() == '' || $('#account_number').val() == ''){
            //             toastr['error']('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน', 'ข้อมูลบัญชี', {
            //             closeButton: true,
            //             tapToDismiss: false,
            //             rtl: isRtl
            //         });
            //         $('html, body').animate({
            //             scrollTop: $("#accountCollapse").position().top
            //         }, 200);
            //         $('#cover-spin').hide(0)
            //         return false;

            //     }
            // }
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
        if ($('#category_id').val() == 'non') {
            toastr['error']('กรุณาเลือกประเภทพัสดุ', 'ประเภทพัสดุ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false

        }
        let courier_code = $('#courier_code').val()

        if(courier_code != 'DPTHAIPOST' && courier_code != 'DPTHAIPOSTS'){
            $('#pre_barcode_track').val('')
        }
        // if($('#category_id').val() == 11 && $('#courier_code').val() !== 'FlashExpressA'){
        //     toastr['error']('ประเภทผลไม้ ต้องเลือก Flash Pro A เท่านั้น', 'ประเภทพัสดุ', {
        //         closeButton: true,
        //         tapToDismiss: false,
        //         rtl: isRtl
        //     });
        //     return false
        // }
       let shop = $('#dropoff_shop_price').val()
       let cost = $('#dropoff_cost_price').val()
       if (shop == 0 && cost == 0) {
            toastr['error']('กรุณาตรวจสอบข้อมูลผู้รับ หรือ ข้อมูลพัสดุ', 'ที่อยู่ผู้รับไมถูกต้องตรวจสอบราคาไม่ได้', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        // if ($('#save_addressx').is(':checked')) {
        //     const result_member = await saveMember()
        //     $('#customer_id').val(result_member)
        // }
        if ($('#save_dst_addressx').is(':checked')) {
            const result_recipien = await  saveRecipientAddress()

        }
        let dst_phone = $('#dst_phone').val()
       if (dst_phone.length < 9) {
            toastr['error']('กรุณาตรวจสอบเบอร์โทรผู้รับ', 'เบอร์โทรผู้รับ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        let cod = $('#cod_amount').val()
        let account_name = $('#account_name').val()
        let account_number = $('#account_number').val()
        if (cod > 0 && (account_number == '' || account_name == '')) {
            toastr['error']('กรุณาตรวจกรอกข้อมูลบัญชี', 'กรอกข้อมูลบัญชี', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }

        if ($('#courier_code').val() == 'NoCourier') {
            toastr['error']('กรุณาเลือกขนส่ง', 'ขนส่ง', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false
        }
        if($('#cod_amountx').is(':checked') && product_lists.length == 0){
            toastr['error']('กรุณากรอกข้อมูลสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false

        }        
        if($('#cod_amountx').is(':checked') && $('#cod_amount').val() == 0){
            toastr['error']('กรุณากรอกค่าเก้บเงินปลายทาง', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false

        }  
        if(product_lists.length > 0 && $('#cod_amount').val() == 0){
            toastr['error']('กรุณากรอกยอดเก็บเงินปลายทาง', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
            return false
        }

        var images_download = false;
        var default_image = 4;
        var count = $('.photo-box img').filter((_, img) => img.src && img.src.trim() != '').length;
        if (user_camera) {
            $('#cover-spin').hide(0);
            try {
                const confirm_create = await Swal.fire({
                    title: 'สร้างรายการ',
                    text: 'ต้องการดำเนินการต่อหรือไม่ ?',
                    icon: 'info',
                    showDenyButton: true,
                    confirmButtonText: 'สร้างและเก็บภาพ',
                    denyButtonText: 'สร้างรายการ',
                    customClass: {
                        confirmButton: 'my-swal-confirm-button',
                        denyButton: 'my-swal-deny-button'
                    },
                    allowOutsideClick: false
                });

                if (confirm_create.isConfirmed) {
                    if (count < default_image) {
                        const confirm_images = await Swal.fire({
                            title: 'สร้างรายการ',
                            text: 'รูปถ่ายยังไม่ครบ ต้องการดำเนินการต่อหรือไม่ ?',
                            icon: 'warning',
                            showDenyButton: true,
                            confirmButtonText: 'ใช่',
                            denyButtonText: 'กลับไปถ่ายรูป',
                            customClass: {
                                confirmButton: 'my-swal-confirm-button',
                                denyButton: 'my-swal-deny-button'
                            },
                            allowOutsideClick: false
                        });

                        if (!confirm_images.isConfirmed) {
                            return;
                        }

                        if (confirm_images.isConfirmed) {
                            images_download = true;
                        }
                    } else {
                        images_download = true;
                    }
                }

            } finally {
                $('#cover-spin').hide(0);
            }
        }
       
        $('#cover-spin').show(0);
        var formDataArray = $('#createOrderForm').serializeArray();
        formDataArray.push({ name: "bank_id", value: $('[name="bank_id"]').val()});
        formDataArray.push({name:"product_lists", value:JSON.stringify(product_lists)});
        formDataArray.push({ name: "cod_amount", value: $('[name="cod_amount"]').val() });
        formDataArray.push({ name: "pre_barcode_track", value: $('#pre_barcode_track').val() });
        formDataArray.push({ name: "label_address_id", value: $('#label_address_id').val() });

          // Convert array to query string format
          var formData = $.param(formDataArray);
        $.post('/shipment', formData).done(async (res) => {
            if(res.status){
                    if((images_download) && (count > 0)) {
                        await window.downloadImagesZip(res.data.track_no, res.category);
                    } 
                    $('#dimension-images').addClass('d-none');
                    $('.photo-box img').removeAttr('src');
                    show_images = false;
                    $('#cover-spin').hide(0)
                    $.get('/still-alive').done(res => {
                        $('.user-credit').text(`เครดิต : ${res.credits}`)
                    })
                    Swal.fire({
                            title: 'ข้อความจากระบบ',
                            text: 'สร้างรายการเรียบร้อยแล้ว',
                            icon: 'success',
                            showDenyButton: false,
                            confirmButtonText: 'ตกลง',
                            confirmButtonColor: '#02e26b',
                            denyButtonText: `สร้างรายการต่อ`,
                            denyButtonColor: '#3085d6',
                            allowOutsideClick: false
                        }).then((result) => {
                            if (result.isConfirmed) {
                                has_label_info = 1;
                                if(save_print == 1){
                                    if(print_size == 'paperang') {
                                        $('#paperangModal').modal('show');
                                        let url = 'https://app.twentyexpress.com'
                                        $('#paperangLink').val(`${url}/print/paperang?order=`+res.data.id, '_blank');
                                        $('#btn-paperang-preview').attr('href', `${url}/print/paperang?order=`+res.data.id);
                                    }else{
                                        window.open(`/print/${print_size}?order=`+res.data.id, '_blank');
                                    }
                                }
                            
                                save_print = 0;
                                loadCartLogs()
                                
                                // $('#dst_search_keyword').val('');
                                // $('#dst_name').val('');
                                // $('#dst_phone').val('');
                                // $('#dst_sub_district').val('');
                                // $('#dst_district').val('');
                                // $('#dst_province').val('');
                                // $('#dst_zipcode').val('');
                                // $('#dst_address').val('');
                                if(lock_dst == 0){
                                    $('#dst_search_keyword').val('');
                                    $('#dst_name').val('');
                                    $('#dst_phone').val('');
                                    $('#dst_sub_district').val('');
                                    $('#dst_district').val('');
                                    $('#dst_province').val('');
                                    $('#dst_zipcode').val('');
                                    $('#dst_address').val('');
                                    $('.search_result_dst').val('')
                                }

                                $('.search_result_dst').prop('disabled', false);
                                $('#current_order').val('');
                                $('#cod_amount').val('');
                                $('#cod_amountx').prop('checked', false);
                                $('#collapseCodAmount').collapse('hide')

                                $('#product_value').val('');
                                $('#insurance_x').prop('checked', false);
                                $('#collapseInsurance').collapse("hide")

                                $('#express_category').val(1);
                                $('#is_urgentx').prop('checked', false);

                                // $('#save_dst_addressx').prop('checked', false);
                                $('#jnt_pickupx').prop('checked', false);
                                $('#txt_cost_dimension_price').text(0)
                                $('#dropoff_cost_dimension_price').val(0)
                                $('#txt_cost_remote_price').text(0)
                                $('#dropoff_cost_remote_price').val(0)
                                $('#txt_dropoff_cost_price').text(0)
                                $('.txt_cost_dimension_price').addClass('d-none')
                                $('#dropoff_cost_dimension_percent').val(0)
                                $('.txt_customer_price').addClass('d-none')
                                $('#txt_customer_price').text(0)
                                $('#dropoff_customer_price').val(0)
                                $('#txt_profit_price').text(0)
                                $('#pre_barcode_track').val('')
                                $('.txt_cost_cod_fee').addClass('d-none')
                                $('#txt_cost_cod_fee').text('')
                                $('#dropoff_cost_cod_fee').val(0)
                                $('.txt_price_cod_fee').addClass('d-none')
                                $('#txt_price_cod_fee').text('')
                                $('#dropoff_price_cod_fee').val(0)
                                $('.txt_cost_on_time').addClass('d-none')
                                $('#txt_cost_on_time').text('')
                                $('.txt_price_on_time').addClass('d-none')
                                $('#txt_price_on_time').text('')
                                $('#dropoff_on_time_price').val(0)
                                
                                //GAS FEE
                                $('#txt_cost_gas').text(0);
                                $('#gas_fee').text(0);
                                $('#price_gas_fee').text(0);
                                

                                $('.txt_cost_insurance_fee').addClass('d-none')
                                $('#txt_cost_insurance_fee').text('')
                                $('.txt_price_insurance_fee').addClass('d-none')
                                $('#txt_price_insurance_fee').text('')
                                $('#dropoff_insurance_fee_price').val(0)
                                $('#remark').val('')
                                if(lock_pacel == 0){
                                    $("#category_id").val('1').change();
                                    $("#box_id").val('1').change();
                                    $('#length').val(0);
                                    $('#height').val(0);
                                    $('#weight').val(0);
                                    $('#kg_weight').val(0);
                                    $('#gram_weight').val(0);
                                    $('#width').val(0);
                                }
                                $('#txt_cost_price').text(0)
                                $('#dropoff_cost_price').val(0)
                                $('#txt_shop_price').text(0)
                                $('#dropoff_shop_price').val(0)
                                $('#txt_remote_price').text(0)
                                $('#remote_price').val(0)
                                $('#txt_total_price').text(0)
                                $('#total_price').val(0)
                                $('#is_box_shieldx').prop('checked', false);
                                $('#is_box_shield').val(0);

                                $('#formulario').empty();
                                product_lists = [];
                                dynamicInput = [];
                                counter = 0;
                                $('#formulario').append(`<div class="card" id="dynamicInput[0]">
                                    <div class="card-header d-flex justify-content-end" >
                                            <button class="btn btn-sm btn-danger" onclick="removeInput('0')">ลบรายการ</button>
                                            <input type="text" class="form-control" hidden  name="pd_index_0" id="pd_index_0" value="0">
                                    </div>
                                    <div class="card-body">
                                        <div class="row" id="pd_cod_0" name="pd_cod_0">
                                            <div class="col-4">
                                                <div class="from-group">
                                                    <label for="">ชื่อสินค้า<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_name_0" id="pd_name_0">
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div class="from-group">
                                                    <label for="">ราคา<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_price_0" id="pd_price_0">
                                                </div>
                                            </div>
                                            <div class="col-4">
                                                <div class="from-group">
                                                    <label for="">จำนวน<label class="text-danger m-0">*</label></label>
                                                    <input type="number" class="form-control" name="pd_qty_0" id="pd_qty_0">
                                                </div>
                                            </div>
                                            <div class="col-2">
                                                <div class="from-group">
                                                    <label for="">น้ำหนัก(Kg.)<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_weight_0" id="pd_weight_0">
                                                </div>
                                            </div>
                                            <div class="col-2">
                                                <div class="from-group">
                                                    <label for="">กว้าง<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_width_0" id="pd_width_0">
                                                </div> 
                                            </div>
                                            <div class="col-2">
                                                <div class="from-group">
                                                    <label for="">ยาว<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_length_0" id="pd_length_0">
                                                </div>
                                            </div>
                                            <div class="col-2">
                                                <div class="from-group">
                                                    <label for="">สูง<label class="text-danger m-0">*</label></label>
                                                    <input type="text" class="form-control" name="pd_height_0" id="pd_height_0">
                                                </div>
                                            </div>

                                            <div class="col-2">
                                                <div class="from-group">
                                                    <label for="">สี<label class="text-danger m-0">*</label></label>
                                                    <select name="pd_color_0" id="pd_color_0" class="form-control pd_color_0" onChange="changeColor(0)">
                                                            <option value="0">กรุณาระบุสี</option>
                                                                                                                    <option value="other">อื่น ๆ(โปรดระบุ)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-2">
                                                <div class="collapse" id="collapseOtherColor_0">
                                                    <div class="from-group">
                                                        <label for="">สีสินค้า<label class="text-danger m-0">*</label></label>
                                                        <input type="text" class="form-control pd_other_color" name="pd_other_color_0" id="pd_other_color_0" value="">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);

                            }
                        });
            }else{
                $('#cover-spin').hide(0)
                if(res.data == 'เครดิตคงเหลือไม่พอ'){
                    if(topup_qrcode) {
                        $('#cover-spin').hide(0)
                        $('#selectPrice').modal('show');
                    } else {
                        toastr['error']('เครดิตคงเหลือไม่พอ', 'ข้อความจากระบบ', {
                            closeButton: true,
                            tapToDismiss: false,
                            rtl: isRtl
                        });
                    }
                    return false;
                }
                if(res.message == 'กรุณาอ่านและยอมรับเงื่อนไขการใช้งาน'){
                    $('#policiesModal').modal('show')
                    return false
                }
                toastr['error'](res.message, 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                return false

                
               
      
            }
        }).fail((res) => {
            toastr['error']('ไม่สามารถสร้างรายการได้ ติดต่อแอดมิน', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)
        })
    }

    function saveMember() {
        return new Promise(resolve => {
            var formData = new FormData();
            formData = $('#createOrderForm').serialize();
            let response
            $.post('/member/add-customer', formData).done((res) => {
                if(res.status){
                    $('#customer_id').val(res.data.id)
                    let data = [];
                    data['status'] = true
                    data['data'] = res
                    response = res.data.id
                    resolve(res.data.id);

                }else{
                    let data = [];
                    data['status'] = false
                    data['data'] = ''
                    response = 0
                    resolve(0);
                }
            })
        });
    }
    
    window.downloadImagesZip = async function (track_no, category) {
        const zip = new JSZip();
        const images_id = [
            'photo_weight',
            'photo_width',
            'photo_length',
            'photo_height',
        ];

        const config = {
            weight: 'น้ำหนัก',
            width: 'กว้าง',
            length: 'ยาว',
            height: 'สูง'
        };

        for (let index = 0; index < images_id.length; index++) {
            const key = images_id[index];
            const image_element = document.getElementById(key);
            if (!image_element || !image_element.src) continue;
            const found = Object.keys(config).find(k => key.includes(k));
            if (!found) continue;

            const thai_name = config[found];
            const round = index + 1;
            const img = new Image();
            img.src = image_element.src;
            await new Promise(resolve => img.onload = resolve);
            const headerHeight = 60;
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height + headerHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, headerHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';      
            ctx.textBaseline = 'middle';   

            
            ctx.fillText(
                `ID: ${track_no} ${category.name} ${take_images_current_time[found]}`,
                canvas.width / 2,            
                headerHeight / 2
            );

            ctx.drawImage(img, 0, headerHeight);
            const new_base64 = canvas
            .toDataURL('image/jpeg', 0.9)
            .split(',')[1];

            zip.file(
            `${round}_${track_no}_${thai_name}.jpg`,
            new_base64,
            { base64: true }
            );
        }

        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        saveAs(blob, `${track_no}_${formatDateTime(true)}.zip`);
    };


    function saveRecipientAddress() {
        var formData = new FormData();
        formData = $('#createOrderForm').serialize();
        $.post('/member/save-recipient-address', formData).done((res) => {
            if(res.status){
                let data = [];
                data['status'] = true
                data['data'] = res
                return data;
            }else{
                let data = [];
                data['status'] = false
                data['data'] = ''
                return data;
            }
        })
    }

    function loadCartLogs() {
        $('#orderLogTable').DataTable({
            processing: true,
            serverSide: true,
            searching: false,
            destroy:true,
            pageLength: -1,
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, "All"]
            ],
            ajax: "/order/getdt-orderlog",
            columns: [
                {
                    "data":"DT_RowIndex",
                    "name":"DT_RowIndex",
                    orderable: false, 
                    searchable: false
                },
                {
                    "data":"product_name",
                    render: function(data, type, full) {
                        if (full.type == 1) {
                            return `<span>${full.track_no} (${data})</span>`
                        } else {
                            return `<span>${data}</span>`
                        }
                    }
                },
                {
                    "data":"cost_price",
                    "visible": '1',
                    render: function(data, type, full) {
                        return parseFloat(data) + parseFloat(full.cost_remote) + parseFloat(full.cost_dimension)  + parseFloat(full.cod_fee) +  parseFloat(full.urgent_fee) +  parseFloat(full.insurance_fee)  + parseFloat(full.gas_fee);
                    }
                },
                {
                    "data":"product_price",
                    render: function(data, type, full) {
                        let edit_price = '1';
                        if(edit_price == 1){
                            return `<input type="number" class="form-control w-100 tproduct_price" id="product_price_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/>`
                        }
                        return data
                    }
                },
                {
                    "data":"remote_area",
                    render: function(data, type, full) {
                        if(full.type == 1){
                            return `<input type="number" class="form-control w-100 tproduct_price" id="remote_area_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/>`
                        }else{
                            return `<input readonly type="number" class="form-control w-100 tproduct_price" id="remote_area_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/>`
                        }
                    }
                },
                {
                    "data":"cod_amount"
                },
                {
                    "data":"cod_fee_shop",
                     render: function(data, type, full) {
                        return data.toFixed(2);
                    }
                },
                {
                    "data":"insurance_fee",
                     render: function(data, type, full) {
                        return data.toFixed(2);
                    }
                },
                {
                    "data":"box_shield_fee",
                     render: function(data, type, full) {
                        return data;
                    }
                },
                {
                    "data":"urgent_fee",
                     render: function(data, type, full) {
                        return data;
                    }
                },
                {
                    "data":"gas_fee",
                     render: function(data, type, full) {        
                        return `<input type="number" class="form-control w-100 gas_fee" id="gas_fee_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/ readonly>`
                    }
                },
                {
                    "data":"product_qty",
                    render: function(data, type, full) {
                        if(full.type == 1){
                            return `<input readonly type="number" class="form-control w-100 tproduct_price" id="product_qty_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/>`
                        }else{
                            return `<input type="number" class="form-control w-100 tproduct_price" id="product_qty_${full.id}" value="${data}" onchange="calculateTable(${full.id})"/>`
                        }
                    }
                },
                {
                    "data":"total_price",
                    render: function(data, type, full) {
                        return `<span id="id_total_price_${full.id}">${data}</span>`;
                    }
                },
                {
                    "data":"action",
                    "name":"action",
                },
            ],
              rowCallback: function(row, data) {
                // let product_price = Number(data.product_price) || 0;
                // let remote_area = Number(data.remote_area) || 0;
                // let gas_fee = Number(data.gas_fee) || 0;
                let new_total = data.total_price;
                $(row).find(`#id_total_price_${data.id}`).text(new_total);
            }
        });
        calculateSummary()

    }  

    function cancelOrder(order_log_id) {
        Swal.fire({
            title:'ลบรายการ?',
            text:'ต้องการลบรายการพัสดุนี้หรือไม่',
            icon:'question',
            showCancelButton:true,
            cancelButtonText:'ยกเลิก',
            confirmButtonText:'ใช่,ลบเลย'
        }).then((itok)=>{
            if(itok.isConfirmed){
                $('#cover-spin').show(0)
                $.get(`/order/cancel-order/${order_log_id}`).done((res)=>{
                    if(res.status){
                        $('#cover-spin').hide(0)
                        loadCartLogs()
                        $.get('/still-alive').done(resp => {
                            $('.user-credit').text(`เครดิต : ${resp.credits}`)
                        })
                    }else{
                        toastr['error'](res.message, 'ข้อความจากระบบ', {
                            closeButton: true,
                            tapToDismiss: false,
                            rtl: isRtl
                        });
                        $('#cover-spin').hide(0)

                        return false
                    }
                })
            }
        })
    }

    function editOrder(order_log_id) {
        Swal.fire({
            title:'แก้ไขรายการ?',
            text:'หากแก้ไขข้อมูลต้องปริ้นใบปะหน้าใหม่',
            icon:'question',
            showCancelButton:true,
            cancelButtonText:'ยกเลิก',
            confirmButtonText:'ใช่,แก้ไขเลย'
        }).then((itok)=>{
            if(itok.isConfirmed){
                $.get(`/order/edit-order/${order_log_id}`).done((res)=>{
                    if(res.status){
                        loadCartLogs()
                        calculateSummary()
                        $('#current_order').val(res.data.id)
                        $('#dst_name').val(res.data.dst_name);
                        $('#dst_phone').val(res.data.dst_phone);
                        $('#dst_district').val(res.data.dst_district);
                        $('#dst_sub_district').val(res.data.dst_sub_district);
                        $('#dst_province').val(res.data.dst_province);
                        $('#dst_zipcode').val(res.data.dst_zipcode);
                        $('#dst_address').val(res.data.dst_address);
                        $('#cod_amount').val(res.data.cod_amount);
                        $('#width').val(res.data.width);
                        $('#length').val(res.data.length);
                        $('#height').val(res.data.height);
                        $('#gram_weight').val(res.data.weight);
                        $('#kg_weight').val(res.data.weight /1000);
                        $('#weight').val(res.data.weight);
                        $("#courier_code").val(res.data.courier_code).change();
                        $("#category_id").val(res.data.category_id).change();
                        $('.search_result_dst').val(`${res.data.dst_sub_district} » ${res.data.dst_district} » ${res.data.dst_province} » ${res.data.dst_zipcode}`)
                        if(res.data.cod_amount > 0){
                            $('#cod_amountx').prop('checked', true);
                        }
                        if(res.data.product_value > 0){
                            $('#insurance_x').prop('checked', true);
                            $('#is_insured').val(1);
                        }
                        if(res.data.is_box_shield == 1){
                            $('#is_box_shieldx').prop('checked', true);
                            $('#is_box_shield').val(1);
                        }
                        checkPrice()
                    }
                })
            }
        })
    }

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
                        percent_discount = (parseFloat(res.data.sum_shipping_fee)* (parseFloat(discount_value)) / 100)
                        $('#discount').val(parseFloat(percent_discount).toFixed(2))
                        sum_shipping_fee = parseFloat(res.data.sum_shipping_fee) - percent_discount
                        shipping_fee_discount = sum_shipping_fee
                    }
                    sum_shipping_fee = sum_shipping_fee + sum_cod_fee + sum_insurance_fee
                    sum_total = sum_shipping_fee
                    if(sum_shipping_fee < 0){
                          toastr['error']('ส่วนลดไม่สามารถมากกว่ายอดสุทธิได้', 'ข้อความจากระบบ', {
                                closeButton: true,
                                tapToDismiss: false,
                                rtl: isRtl
                            });
                        $('#discount_value').val(0)
                        return false;
                    }
                    $('#cash').val((sum_shipping_fee).toFixed(2))
                   
                    $('#total_amount').val(sum_shipping_fee.toFixed(2))

                }
                if($('#on_holding').val() == 1){
                    shipping_fee_hold = (shipping_fee_discount * (1/100))
                    cod_fee_hold =(sum_cod_fee * (3/100))
                    insurance_fee_hold =(sum_insurance_fee * (3/100))
                    total_amount = sum_total - shipping_fee_hold -  cod_fee_hold - insurance_fee_hold;
                    let vat_3 = cod_fee_hold + insurance_fee_hold;
                    // total_amount = rounded_num(total_amount)

                    $('#vat_1').val(shipping_fee_hold.toFixed(2))
                    $('#vat_3').val(vat_3.toFixed(2))
                    $('#total_amount').val(total_amount.toFixed(2))
                    $('#cash').val((total_amount).toFixed(2))
                }

                

            }else{
                
                $('#total').val(0.00)
                $('#total_amount').val(0.00)

            }
        })
    }
    function rounded_num(number) {
        return Math.ceil(number * 20) / 20;
    }
    function onSelectProduct() {
        $('#selectProductModal').modal('show')
        loadProductTable()
    }
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
    function printPreview(size) {
        $.get('/order/get-track-cart').done((res) => {
            if(res.length > 0){
                $.get(`/print/select-orders/${size}`,{"orders":res}).done((resp) => {
                    if(res){
                        if(size == 'paperang') {
                            $('#paperangModal').modal('show');
                            let url = 'https://app.twentyexpress.com'
                            $('#paperangLink').val(`${url}/print/paperang?order=`+resp, '_blank');
                            $('#btn-paperang-preview').attr('href', `${url}/print/paperang?order=`+resp);
                        }else{
                            window.open(`/print/${size}?order=`+resp, '_blank');
                        }
                    }
                })
            }
        })
    }
    function printLabel(size,shipping_id) {
        window.open(`/print/${size}?order=`+shipping_id, '_blank');

    }
    function createDropoff(type,size) {
        let invoice_branch = 'no';
        let val = $("[name='is_branch']:checked").val();
        if($('#is_invoice').val() == 1){
            if (val == 'sub_company') {
                invoice_branch = $('#invoice_branch').val();
            } else {
                invoice_branch = 'main'
            }
        }


        Swal.fire({
            title:'สิ้นสุดรายการ?',
            text:'ต้องการสิ้นสุดรายการใช่หรือไม่',
            icon:'question',
            showCancelButton:true,
            cancelButtonText:'ไม่, ทำรายการต่อ',
            confirmButtonText:'ใช่,บันทึกเลย'
        }).then((itok)=>{
            if(itok.isConfirmed){
                $.post('/order/create-bill', {
                    '_token':'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su',
                    'total': $('#total_amount').val(),
                    'cash': $('#cash').val(),
                    'change': $('#change').val(),
                    'payment_type': $('#payment_type').val(),
                    'discount_type': $('#discount_type').val(),
                    'discount_value': $('#discount_value').val(),
                    'discount': $('#discount').val(),
                    'on_holding': $('#on_holding').val(),
                    'is_vat': $('#is_vat').val(),
                    'vat_1': $('#vat_1').val(),
                    'vat_3': $('#vat_3').val(),
                    'is_invoice': $('#is_invoice').val(),

                    'invoice_customer_name': $('#invoice_customer_name').val(),
                    'invoice_customer_phone': $('#invoice_customer_phone').val(),
                    'invoice_customer_tax_id': $('#invoice_customer_tax_id').val(),
                    'invoice_customer_address': $('#invoice_customer_address').val(),
                    'invoice_customer_zipcode': $('#invoice_customer_zipcode').val(),
                    'invoice_customer_email': $('#invoice_customer_email').val(),
                    'invoice_branch': invoice_branch,
                }).done((res) => {
                    if(res.status){
                        if(type == 'print'){
                            if(size == '80mm'){
                                window.open('/print/print-bill/'+res.data.id+'/80', '_blank');
                            }else if(size == '100mm'){
                                window.open('/print/print-bill/'+res.data.id+'/100', '_blank');
                            }else if(size == 'pdf'){
                                window.open('/print/print-bill/'+res.data.id+'/pdf', '_blank');
                            }else if(size == 'pdfa4'){
                                window.open('/print/print-bill/'+res.data.id+'/pdfa4', '_blank');
                            }else{
                                window.open('/print/print-bill/'+res.data.id+'/58', '_blank');
                            }
                        }
                    
                        location.reload()

                    }
                });
            }
        })
 
    }
    //on keyup search customer
    let search_label_address_world = 0;

    $('#label_search_keyword').on('keyup',function(){
        if(this.value != '' && this.value.length > 7){
            $.get(`/search-customer?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.label_search_result').addClass('scrollable');
                }else{
                    $('.label_search_result').removeClass('scrollable');
                }
                $('.label_search_result').empty();
                $('.label_search_result').addClass('d-none');
                if(res.length > 0){
                    search_label_address_world = 1;
                    res.map( item => {
                        $('.label_search_result').removeClass('d-none');
                        $('.label_search_result').append(`<li class="list-group-item" onclick="setLabelSearch('${item.phone}','${item.name}','${item.address_no}','${item.district}','${item.amphure}','${item.province}','${item.zipcode}','${item.card_id}','${item.address_id}','${item.customer_id}')">${item.name} » (${item.phone}) » ${item.address_no} ${item.district} ${item.amphure} ${item.province} ${item.zipcode}</li>`)
                    })
                }
            });
        }else{
            $('.label_search_result').empty();
            $('.label_search_result').addClass('d-none');
        }
    })

    function setLabelSearch(phone,name,address,district,amphure,province,zipcode,card_id,address_id,customer_id) {
        if(customer_id != undefined){
            $('#invoice_customer_name').val()
            $('#invoice_customer_phone').val()
            $('#invoice_customer_tax_id').val()
            $('#invoice_customer_address').val()
            $('#invoice_customer_zipcode').val()
            $('#invoice_customer_email').val()
            $('#is_branchx').prop('checked', false);
            $('#is_company').val(0)
            $('input[name="is_branch"][value="main_company"]').prop('checked', false);
            $('input[name="is_branch"][value="sub_company"]').prop('checked', false);
            $.get(`/search-customer-by-id/${customer_id}`).done((res)=>{
                $('#label_search_keyword').val(phone);
                $('#label_address_id').val(address_id);
                $('.label_search_result').empty();
                $('.label_search_result').addClass('d-none');
                $('.save_address_div').removeClass('d-none')
                if(has_label_info == 0){
                    $('#label_name').val(name)
                    $('#label_phone').val(phone)
                    if(card_id != null && card_id != 'null' && card_id != 'undefined' ){
                        $('#card_id').val(card_id)
                    }
                    $('#label_address').val(address)
                    $('#label_sub_district').val(district)
                    $('#label_district').val(amphure)
                    $('#label_province').val(province)
                    $('#label_zipcode').val(zipcode)
                    $('#customer_id').val(customer_id)
                    $('.thailand_keyword').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
                    if(res.data.invoice_name != null){
                        $('#invoice_customer_name').val(res.data.invoice_name)
                        $('#invoice_customer_phone').val(res.data.invoice_phone)
                        $('#invoice_customer_tax_id').val(res.data.invoice_tax_id)
                        $('#invoice_customer_address').val(res.data.invoice_address)
                        $('#invoice_customer_zipcode').val(res.data.invoice_zipcode)
                        $('#invoice_customer_email').val(res.data.invoice_email)
                        if(res.data.is_company == 1){
                            $('#is_company').val(res.data.is_company)
                            $('#is_branchx').prop('checked', true);
                            $('#collapseBranch').collapse("show")
                            if(res.data.invoice_branch == 0){
                                $('input[name="is_branch"][value="main_company"]').prop('checked', true);
                            }else{
                                $('input[name="is_branch"][value="sub_company"]').prop('checked', true);
                                $('#invoice_branch').val(res.data.invoice_branch);
                            }
                        }
                    }

                    
                    searchCustomer() // เช็คว่ามีการสร้างรายการทิ้งไว้ไหม
                }else{
                    Swal.fire({
                        title:'มีรายการค้างอยู่?',
                        text:'คุณมีรายการค้างอยู่ต้องการสิ้นสุดรายการใช่หรือไม่',
                        icon:'question',
                        showCancelButton:true,
                        cancelButtonText:'ไม่,สร้างรายการต่อ',
                        confirmButtonText:'ใช่,สิ้นสุดเลย'
                    }).then((itok)=>{
                        if(itok.isConfirmed){
                            let total_amount = $('#total_amount').val()
                            $('#cash').val(total_amount)
                            $('#change').val(0)
                            calculateSummary()
                            createDropoff('print','80mm')
                        }
                    })
                }
            })
        }else{
            $('#label_search_keyword').val(phone);
            $('#label_address_id').val(address_id);
            $('.label_search_result').empty();
            $('.label_search_result').addClass('d-none');
            $('.save_address_div').removeClass('d-none')
            if(has_label_info == 0){
                $('#label_name').val(name)
                $('#label_phone').val(phone)
                if(card_id != null && card_id != 'null' && card_id != 'undefined' ){
                    $('#card_id').val(card_id)
                }
                $('#label_address').val(address)
                $('#label_sub_district').val(district)
                $('#label_district').val(amphure)
                $('#label_province').val(province)
                $('#label_zipcode').val(zipcode)
                $('#customer_id').val(customer_id)
                $('.thailand_keyword').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
                
                searchCustomer() // เช็คว่ามีการสร้างรายการทิ้งไว้ไหม
            }else{
                Swal.fire({
                    title:'มีรายการค้างอยู่?',
                    text:'คุณมีรายการค้างอยู่ต้องการสิ้นสุดรายการใช่หรือไม่',
                    icon:'question',
                    showCancelButton:true,
                    cancelButtonText:'ไม่,สร้างรายการต่อ',
                    confirmButtonText:'ใช่,สิ้นสุดเลย'
                }).then((itok)=>{
                    if(itok.isConfirmed){
                        let total_amount = $('#total_amount').val()
                        $('#cash').val(total_amount)
                        $('#change').val(0)
                        calculateSummary()
                        createDropoff('print','80mm')
                    }
                })
            }
        }
  
   
    }
    
    //on keyup search dst
    $('#dst_search_keyword').on('keyup',function(){
        if(this.value != ''&& this.value.length > 7){
            $.get(`/search-dst?keyword=${this.value}`).done((res)=>{
                if(res.length > 10){
                    $('.dst_info_search_result').addClass('scrollable');
                }else{
                    $('.dst_info_search_result').removeClass('scrollable');
                }
                $('.dst_info_search_result').empty();
                $('.dst_info_search_result').addClass('d-none');
                res.map( item => {
                $('.dst_info_search_result').removeClass('d-none');
                    $('.dst_info_search_result').append(`<li class="list-group-item" onclick="setDstSearch('${item.phone}','${item.name}','${item.address}','${item.district}','${item.amphure}','${item.province}','${item.zipcode}')">${item.name} » (${item.phone}) » ${item.address} ${item.district} ${item.amphure} ${item.province} ${item.zipcode}</li>`)
                })
            });
        }else{
            $('.dst_info_search_result').empty();
            $('.dst_info_search_result').addClass('d-none');
        }
    })

    let search_dst_address_world = 0;
    function setDstSearch(phone,name,address,district,amphure,province,zipcode) {
        $('#dst_search_keyword').val(phone);
        $('.dst_info_search_result').empty();
        $('.dst_info_search_result').addClass('d-none');
        $('#dst_name').val(name)
        $('#dst_phone').val(phone)
        $('#dst_address').val(address)
        $('#dst_sub_district').val(district)
        $('#dst_district').val(amphure)
        $('#dst_province').val(province)
        $('#dst_zipcode').val(zipcode)
        search_dst_address_world = 1;
        searchDestination(phone)
        // $('.search_result_dst').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
        if ([district, amphure, province, zipcode].every(v => v)) {
            $('.search_result_dst').val(`${district} » ${amphure} » ${province} » ${zipcode}`)
        }

    }


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

            return false
        }
        if ($('#dst_provicne').val() == '' || $('#widht').val() == 0) {
            toastr['error']('กรุณากรอกจังหวัดผู้รับ', 'ข้อมูลผู้รับ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        if ($('#dst_zipcode').val() == '' || $('#widht').val() == 0) {
            toastr['error']('กรุณากรอกรหัสไปรษณีย์ผู้รับ', 'ข้อมูลผู้รับ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false
        }
        $('#cover-spin').show(0)
        var formDataArray = $('#createOrderForm').serializeArray();
        formDataArray.push({ name: "_token", value: 'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su'});
        var formData = $.param(formDataArray);
        formData += '&filter=' + data;

        // Convert array to query string format
        $('#comparePriceModal').modal('show');
        // var formData = new FormData();
        // formData = $('#createOrderForm').serialize() ;

        let dst_name = $('#dst_name').val()
        let dst_phone = $('#dst_phone').val()
        let dst_sub_district = $('#dst_sub_district').val()
        let dst_district = $('#dst_district').val()
        let dst_provicne = $('#dst_provicne').val()
        let dst_zipcode = $('#dst_zipcode').val()
        $('.body-price').empty()

        $.get(`/order/compare-price`,formData).done((res)=>{
            if(res.length > 0){
                $('#cover-spin').hide(0)
                let content = '';
                let ct = '';
                let courier_name = '';
                let logo = '';
                let recomend = '';
                let recomend_text = '';
                let app = 'TwentyExpress';
                res.map((item,index) => {
                    if(app == 'SuperShip'){
                            //flash 
                            if(item.courier_code == 'FlashLive'){
                                courier_name = 'Flash Express';
                                // logo = '../../../express/flash-express-live.png'
                                logo = '../../../express/flash-express-mobile.png'
                            }
                            if(item.courier_code == 'FlashExpressA'){
                                courier_name = 'Flash Pro A';
                                // logo = '../../../express/flash-express-a.png'
                                logo = '../../../express/flash-express-a-mobile.png'
                            }
                            //flash fruit
                            if(item.courier_code == 'SPSXFLASHFRUIT'||item.courier_code == 'DPFLASHAFRUIT'||item.courier_code == 'DPFLASHQFRUIT'||item.courier_code == 'DPFLASHLIVEFRUIT'){
                                courier_name = 'Flash Fruit';
                                // logo = '../../../express/flash-express-fruit.png'
                                logo = '../../../express/flash-express-fruit-mobile.png'
                            }
                            //flash 
                            if(item.courier_code == 'FlashExpress' || 
                                item.courier_code == 'SPSXFLASH'|| 
                                item.courier_code == 'SPSXFLASHS' || 
                                item.courier_code == 'FlashExpressD'|| 
                                item.courier_code == 'FlashExpressS'|| 
                                item.courier_code == 'SPSXFLASHY'|| 
                                item.courier_code == 'DPFLASH'|| 
                                item.courier_code == 'DPFLASHA'|| 
                                item.courier_code == 'DPFLASHAS'|| 
                                item.courier_code == 'DPFLASHQ'|| 
                                item.courier_code == 'DPFLASHLIVE'|| 
                                item.courier_code == 'FlashDplus'|| 
                                item.courier_code == 'FlashExpressY'
                            ){
                                courier_name = 'Flash Pro B';
                                // logo = '../../../express/flash-express.png'
                                logo = '../../../express/flash-express-mobile.png'
                            }
                            if(item.courier_code == 'DPFLASHLIVES' ){
                                courier_name = 'Flash 100 cm.';
                                // logo = '../../../express/flash-express-bulky.png'
                                logo = '../../../express/flash-100cm-mobile.jpg'
                            }
                            //flash 
                            if(item.courier_code == 'FlashExpressC' ||item.courier_code == 'SPSXFLASHBULKY'|| item.courier_code == 'FlashBulky'|| item.courier_code == 'DPFLASHABULKY'|| item.courier_code == 'DPFLASHQBULKY'|| item.courier_code == 'DPFLASHLIVEBULKYX'|| item.courier_code == 'DPFLASHABULKYX'|| item.courier_code == 'DPFLASHLIVEBULKY'  ){
                                courier_name = 'Flash Bulky';
                                // logo = '../../../express/flash-express-bulky.png'
                                logo = '../../../express/flash-express-mobile.png'
                            }
                            if(item.courier_code =='DHL' || item.courier_code =='ISPDHL'|| item.courier_code =='DPDHL'){
                                courier_name = 'DHL';
                                // logo = '../../../express/dhl-express.png'
                                logo = '../../../express/dhl-mobile.png'

                            }
                            if(item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT' || item.courier_code == 'DPJNTEXPRESS'){
                                courier_name = 'J&T Express';
                                // logo = '../../../express/jnt-express.png'
                                logo = '../../../express/jnt-express-mobile.png'

                            }
                            if(item.courier_code == 'NinjaVan'|| item.courier_code == 'DPNINJA'){
                                courier_name = 'NinjaVan';
                                // logo = '../../../express/ninjavan.png'
                                logo = '../../../express/ninjavan-mobile.png'
                            }
                            if(item.courier_code == 'ShopeeExpress'|| item.courier_code == 'ISPSPX'|| item.courier_code =='DPSHOPEE'){
                                courier_name = 'ShopeeExpress';
                                // logo = '../../../express/spx.png'
                                logo = '../../../express/spx-mobile.jpg'
                            }
                            if(item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST'|| item.courier_code == 'DPTHAIPOSTS'|| item.courier_code == 'ISPTHP'|| item.courier_code =='THP_eParcelX' || item.courier_code =='ISPTHPX'){
                                courier_name = 'ไปรษณีย์ไทย (EMS)';
                                // logo = '../../../express/THP-eParcel.png'
                                logo = '../../../express/THP-eParcel-mobile.png'
                            }
                            if(item.courier_code == 'KerryExpress'|| item.courier_code == 'DPKERRY'|| item.courier_code == 'DPKERRYQ' || item.courier_code == 'DPKERRYS' || item.courier_code == 'ISPKEX'  ){
                                courier_name = 'Kerry Express';
                                // logo = '../../../express/kerry-express.png'
                                logo = '../../../express/kerry-express-mobile.png'
                            }
                            if(item.courier_code == 'DPKERRYBULKY' ){
                                courier_name = 'Kerry Express';
                                // logo = '../../../express/kerry-express.png'
                                logo = '../../../express/kex-bulky-mobile.png'
                            }
                            if(item.courier_code == 'DPBESTEXPRESS' ){
                                courier_name = 'Best Express';
                                // logo = '../../../express/best-express.png'
                                logo = '../../../express/best-express-mobile.png'
                            }
                        }else{
                            if(item.courier_code == 'FlashLive'){
                                courier_name = 'Flash Express';
                                // logo = '../../../express/flash-express-live.png'
                                logo = '../../../express/flash-express-live-mobile.png'
                            }
                            if(item.courier_code == 'FlashExpressA'){
                                courier_name = 'Flash Pro A';
                                // logo = '../../../express/flash-express-a.png'
                                logo = '../../../express/flash-express-a-mobile.png'
                            }
                            if(item.courier_code == 'SPSXFLASHFRUIT'||item.courier_code == 'DPFLASHAFRUIT'||item.courier_code == 'DPFLASHQFRUIT'||item.courier_code == 'DPFLASHLIVEFRUIT'){
                                courier_name = 'Flash Fruit';
                                // logo = '../../../express/flash-express-fruit.png'
                                logo = '../../../express/flash-express-fruit-mobile.png'
                            }
                            //flash 
                            if(item.courier_code == 'FlashExpress' || 
                                item.courier_code == 'SPSXFLASH'|| 
                                item.courier_code == 'SPSXFLASHBULKY'|| 
                                item.courier_code == 'SPSXFLASHS' || 
                                item.courier_code == 'FlashExpressD'|| 
                                item.courier_code == 'FlashExpressS'|| 
                                item.courier_code == 'SPSXFLASHY'|| 
                                item.courier_code == 'DPFLASH'|| 
                                item.courier_code == 'DPFLASHA'|| 
                                item.courier_code == 'DPFLASHAS'|| 
                                item.courier_code == 'DPFLASHQ'|| 
                                item.courier_code == 'DPFLASHLIVE'|| 
                                item.courier_code == 'FlashDplus'|| 
                                item.courier_code == 'FlashExpressY'
                            ){
                                courier_name = 'Flash Pro B';
                                // logo = '../../../express/flash-express.png'
                                logo = '../../../express/flash-express-mobile.png'
                            }
                            if(item.courier_code == 'DPFLASHLIVES' ){
                                courier_name = 'Flash 100 cm.';
                                // logo = '../../../express/flash-express-bulky.png'
                                logo = '../../../express/flash-100cm-mobile.jpg'
                            }
                            if(item.courier_code == 'FlashExpressC' || item.courier_code == 'FlashBulky'|| item.courier_code == 'DPFLASHABULKY'|| item.courier_code == 'DPFLASHQBULKY'|| item.courier_code == 'DPFLASHABULKYX'|| item.courier_code == 'DPFLASHLIVEBULKY' || item.courier_code == 'DPFLASHLIVEBULKYX'){
                                courier_name = 'Flash Bulky';
                                // logo = '../../../express/flash-express-bulky.png'
                                logo = '../../../express/flash-express-bulky-mobile.png'
                            }
                            if(item.courier_code =='DHL' || item.courier_code =='ISPDHL'|| item.courier_code =='DPDHL'){
                                courier_name = 'DHL';
                                // logo = '../../../express/dhl-express.png'
                                logo = '../../../express/dhl-mobile.png'

                            }
                            if(item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT' || item.courier_code == 'DPJNTEXPRESS'){
                                courier_name = 'J&T Express';
                                // logo = '../../../express/jnt-express.png'
                                logo = '../../../express/jnt-express-mobile.png'

                            }
                            if(item.courier_code == 'NinjaVan'|| item.courier_code == 'DPNINJA'){
                                courier_name = 'NinjaVan';
                                // logo = '../../../express/ninjavan.png'
                                logo = '../../../express/ninjavan-mobile.png'
                            }
                            if(item.courier_code == 'ShopeeExpress'|| item.courier_code == 'ISPSPX'|| item.courier_code =='DPSHOPEE'){
                                courier_name = 'ShopeeExpress';
                                // logo = '../../../express/spx.png'
                                logo = '../../../express/spx-mobile.jpg'
                            }
                            if(item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST'|| item.courier_code == 'DPTHAIPOSTS'|| item.courier_code == 'ISPTHP'|| item.courier_code =='THP_eParcelX' || item.courier_code =='ISPTHPX'){
                                courier_name = 'ไปรษณีย์ไทย (EMS)';
                                // logo = '../../../express/THP-eParcel.png'
                                logo = '../../../express/THP-eParcel-mobile.png'
                            }
                            if(item.courier_code == 'KerryExpress'|| item.courier_code == 'DPKERRY'|| item.courier_code == 'DPKERRYQ'|| item.courier_code == 'DPKERRYS' || item.courier_code == 'ISPKEX'  ){
                                courier_name = 'Kerry Express';
                                // logo = '../../../express/kerry-express.png'
                                logo = '../../../express/kerry-express-mobile.png'
                            }
                            if(item.courier_code == 'DPKERRYBULKY' ){
                                courier_name = 'Kerry Express';
                                // logo = '../../../express/kerry-express.png'
                                logo = '../../../express/kex-bulky-mobile.png'
                            }
                            if(item.courier_code == 'DPBESTEXPRESS' ){
                                courier_name = 'Best Express';
                                // logo = '../../../express/best-express.png'
                                logo = '../../../express/best-express-mobile.png'
                            }
                        }
                        console.log('logo : ', logo);
                        if(index == 0){
                            recomend = 'border-red';
                            recomend_text = `<div class="recomend-text"><span style="color:white">กำไรมากที่สุด</span></div>`
                        }  else{
                            recomend = '';
                            recomend_text =''
                        }   

                        customer_price = parseFloat(item.customer_price)  > 0 ? item.customer_price : item.price ;
                        customer_price = parseFloat(customer_price) + parseFloat(item.price_remote);
                        total_price = parseFloat(item.cost) + parseFloat(item.price_remote);
                        check_weight_text_use = parseFloat(item.cost_weight) +  parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger'
                        check_dimension_text_use = 0;

                        check_dimension_text_use = parseFloat(item.cost_dimension_percent) +  parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger'
                        if(item.price_policies == 'dimension'){
                            check_dimension_text_use = 'text-success'
                        }
                        if(item.cost_weight == item.cost_dimension_percent){
                            check_weight_text_use = 'text-danger';
                            check_dimension_text_use = 'text-success'
                        }
                        if(item.cost_weight == item.cost_dimension){
                            check_weight_text_use = 'text-danger';
                            check_dimension_text_use = 'text-success'
                        }
                        if(item.price_policies == 'dimension' && item.dimension_percent != 0){
                            check_weight_text_use = 'text-success';
                            check_dimension_text_use = 'text-success'
                        }
                    
                        if(item.message){
                            ct = `<div class="card ${recomend}">
                                    <div class="card-body" style="background:#F2F3F4">
                                        ${recomend_text}
                                        <div class="row align-items-center">
                                            <div class="col-12 col-md-4">
                                                <div class="d-flex mobile-style">
                                                    <img src="${logo}" style="width: 46%; height: auto;" id="courier-logo" />
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-8">
                                                <div class="text-center">
                                                    <span>${item.message}</span><br>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        }else{
                            ct = `<div class="card ${recomend}">
                                <div class="card-body">
                                    ${recomend_text}
                                    <div class="row align-items-center table-responsive">
                                        <div class="col-12 col-md-2">
                                            <div class="d-flex mobile-style">
                                                <img src="${logo}" style="width: 100%; height: auto;" id="courier-logo" />
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-2">
                                            <div class="text-center">
                                                <span class="text-secondary">ค่าขนส่ง(น้ำหนัก)</span><br>
                                                <strong class="${check_weight_text_use}" style="font-size:16px;"> ${numberWithCommas(item.cost_weight)}</strong>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-2">
                                            <div class="text-center">
                                                <span class="text-secondary">ค่าขนส่ง(ปริมาตร)</span><br>
                                                <strong class=" ${check_dimension_text_use} " style="font-size:16px;"> ${item.cost_dimension_percent != 0 ? numberWithCommas(item.cost_dimension_percent) : numberWithCommas(item.cost_dimension)}</strong>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-2">
                                            <div class="text-center">
                                                <span class="text-secondary">พื้นที่ห่างไกล/พื้นที่ท่องเที่ยว</span><br>
                                                <strong class="" style="font-size:16px; color:gray">${numberWithCommas(item.cost_remote)}</strong>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-2">
                                            <div class="text-center">
                                                <span class="text-secondary">รวม</span><br>
                                                <strong class="text-warning" style="font-size:16px;">ทุน: ${numberWithCommas(item.sum_cost)}</strong><br/>
                                                <strong class="text-primary" style="font-size:16px;">ขาย: ${numberWithCommas(customer_price)}</strong><br/>
                                                <strong class="text-success" style="font-size:16px;">กำไร: ${numberWithCommas(item.profit)}</strong><br/>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-2">
                                            <div class="d-flex justify-content-center">
                                                <button class="btn btn-sm btn-primary" onclick="onUseCourier('${item.courier_code}')">ใช้งาน</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        }
                        content = content+ct;
                });

            

                $('.body-price').append(content)
                $('#comparePriceModal').modal('show');
            }
        }).fail((res)=>{
            showError('ไม่สามารถตรวจสอบราคาได้กรุณาตรวจสอบข้อมูล', 'ข้อความจากระบบ');
            $('#cover-spin').hide(0)
            $('#comparePriceModal').modal('hide');
        });
    }

    // function comparePrice() {
    //     if ($('#weight').val() == '' || $('#weight').val() == 0) {
    //         toastr['error']('กรุณากรอกน้ำหนัก', 'ข้อมูลพัสดุ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)
    //         return false
    //     }
    //     if ($('#width').val() == '' || $('#width').val() == 0) {
    //         toastr['error']('กรุณากรอกความกว้าง', 'ข้อมูลพัสดุ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#length').val() == '' || $('#length').val() == 0) {
    //         toastr['error']('กรุณากรอกความยาว', 'ข้อมูลพัสดุ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#height').val() == '' || $('#height').val() == 0) {
    //         toastr['error']('กรุณากรอกความสูง', 'ข้อมูลพัสดุ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#dst_sub_district').val() == '' || $('#widht').val() == 0) {
    //         toastr['error']('กรุณากรอกตำบลผู้รับ', 'ข้อมูลผู้รับ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#dst_district').val() == '' || $('#widht').val() == 0) {
    //         toastr['error']('กรุณากรอกอำเภอผู้รับ', 'ข้อมูลผู้รับ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#dst_provicne').val() == '' || $('#widht').val() == 0) {
    //         toastr['error']('กรุณากรอกจังหวัดผู้รับ', 'ข้อมูลผู้รับ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     if ($('#dst_zipcode').val() == '' || $('#widht').val() == 0) {
    //         toastr['error']('กรุณากรอกรหัสไปรษณีย์ผู้รับ', 'ข้อมูลผู้รับ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)

    //         return false
    //     }
    //     $('#cover-spin').show(0)
    //     var formDataArray = $('#createOrderForm').serializeArray();
    //     formDataArray.push({ name: "_token", value: 'AXmBKM7WD73XcMnTo8TG9LcpoNTwvstItBKC92su'});
    //     var formData = $.param(formDataArray);

    //       // Convert array to query string format
    //     $('#comparePriceModal').modal('show');
    //     // var formData = new FormData();
    //     // formData = $('#createOrderForm').serialize() ;

    //     let dst_name = $('#dst_name').val()
    //     let dst_phone = $('#dst_phone').val()
    //     let dst_sub_district = $('#dst_sub_district').val()
    //     let dst_district = $('#dst_district').val()
    //     let dst_provicne = $('#dst_provicne').val()
    //     let dst_zipcode = $('#dst_zipcode').val()
    //     $('.body-price').empty()
    //     $.post(`/order/compare-price-v2`,formData).done((res)=>{
    //         if(res.length > 0){
    //             $('#cover-spin').hide(0)
    //             let content = '';
    //             let ct = '';
    //             let courier_name = '';
    //             let logo = '';
    //             let recomend = '';
    //             let recomend_text = '';
    //             let app = 'TwentyExpress'
    //             res.map((item,index) => {
    //                 if(app == 'SuperShip'){
    //                     if(item.courier_code == 'FlashLive'){
    //                         courier_name = 'Flash Express';
    //                         logo = '../../../express/flash-express-live.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpressA'){
    //                         courier_name = 'Flash Pro A';
    //                         logo = '../../../express/flash-express-a.png'
    //                     }
    //                     if(item.courier_code == 'SPSXFLASHFRUIT'||item.courier_code == 'DPFLASHAFRUIT'||item.courier_code == 'DPFLASHQFRUIT'||item.courier_code == 'DPFLASHLIVEFRUIT'){
    //                         courier_name = 'Flash Fruit';
    //                         logo = '../../../express/flash-express-fruit.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpress' || 
    //                         item.courier_code == 'SPSXFLASH'|| 
    //                         item.courier_code == 'SPSXFLASHS' || 
    //                         item.courier_code == 'FlashExpressD'|| 
    //                         item.courier_code == 'FlashExpressS'|| 
    //                         item.courier_code == 'SPSXFLASHY'|| 
    //                         item.courier_code == 'DPFLASH'|| 
    //                         item.courier_code == 'DPFLASHA'|| 
    //                         item.courier_code == 'DPFLASHAS'|| 
    //                         item.courier_code == 'DPFLASHQ'|| 
    //                         item.courier_code == 'DPFLASHLIVE'|| 
    //                         item.courier_code == 'FlashDplus'|| 
    //                         item.courier_code == 'FlashExpressY'
    //                     ){
    //                         courier_name = 'Flash Pro B';
    //                         logo = '../../../express/flash-express.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpressC' ||item.courier_code == 'SPSXFLASHBULKY'|| item.courier_code == 'FlashBulky'|| item.courier_code == 'DPFLASHABULKY'|| item.courier_code == 'DPFLASHQBULKY'|| item.courier_code == 'DPFLASHLIVEBULKYX'|| item.courier_code == 'DPFLASHABULKYX'|| item.courier_code == 'DPFLASHLIVEBULKY'  ){
    //                         courier_name = 'Flash Bulky';
    //                         logo = '../../../express/flash-express-bulky.png'
    //                     }
    //                     if(item.courier_code =='DHL' || item.courier_code =='ISPDHL'|| item.courier_code =='DPDHL'){
    //                         courier_name = 'DHL';
    //                         logo = '../../../express/dhl-express.png'

    //                     }
    //                     if(item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT'){
    //                         courier_name = 'J&T Express';
    //                         logo = '../../../express/jnt-express.png'

    //                     }
    //                     if(item.courier_code == 'NinjaVan'|| item.courier_code == 'DPNINJA'){
    //                         courier_name = 'NinjaVan';
    //                         logo = '../../../express/ninjavan.png'
    //                     }
    //                     if(item.courier_code == 'ShopeeExpress'|| item.courier_code == 'ISPSPX'|| item.courier_code =='DPSHOPEE'){
    //                         courier_name = 'ShopeeExpress';
    //                         logo = '../../../express/spx.png'
    //                     }
    //                     if(item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST'|| item.courier_code == 'ISPTHP'|| item.courier_code =='THP_eParcelX' || item.courier_code =='ISPTHPX'){
    //                         courier_name = 'ไปรษณีย์ไทย (EMS)';
    //                         logo = '../../../express/THP-eParcel.png'
    //                     }
    //                     if(item.courier_code == 'KerryExpress'|| item.courier_code == 'DPKERRY'|| item.courier_code == 'DPKERRYQ' || item.courier_code == 'ISPKEX'|| item.courier_code == 'DPKERRYS' || item.courier_code == 'DPKERRYBULKY' ){
    //                         courier_name = 'Kerry Express';
    //                         logo = '../../../express/kerry-express.png'
    //                     }
    //                     if(item.courier_code == 'DPBESTEXPRESS' ){
    //                         courier_name = 'Best Express';
    //                         logo = '../../../express/best-express.png'
    //                     }
    //                 }else{
    //                     if(item.courier_code == 'FlashLive'){
    //                         courier_name = 'Flash Express';
    //                         logo = '../../../express/flash-express-live.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpressA'){
    //                         courier_name = 'Flash Pro A';
    //                         logo = '../../../express/flash-express-a.png'
    //                     }
    //                     if(item.courier_code == 'SPSXFLASHFRUIT'||item.courier_code == 'DPFLASHAFRUIT'||item.courier_code == 'DPFLASHQFRUIT'||item.courier_code == 'DPFLASHLIVEFRUIT'){
    //                         courier_name = 'Flash Fruit';
    //                         logo = '../../../express/flash-express-fruit.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpress' || 
    //                         item.courier_code == 'SPSXFLASH'|| 
    //                         item.courier_code == 'SPSXFLASHBULKY'|| 
    //                         item.courier_code == 'SPSXFLASHS' || 
    //                         item.courier_code == 'FlashExpressD'|| 
    //                         item.courier_code == 'FlashExpressS'|| 
    //                         item.courier_code == 'SPSXFLASHY'|| 
    //                         item.courier_code == 'DPFLASH'|| 
    //                         item.courier_code == 'DPFLASHA'|| 
    //                         item.courier_code == 'DPFLASHAS'|| 
    //                         item.courier_code == 'DPFLASHQ'|| 
    //                         item.courier_code == 'DPFLASHLIVE'|| 
    //                         item.courier_code == 'FlashDplus'|| 
    //                         item.courier_code == 'FlashExpressY'
    //                     ){
    //                         courier_name = 'Flash Pro B';
    //                         logo = '../../../express/flash-express.png'
    //                     }
    //                     if(item.courier_code == 'FlashExpressC' || item.courier_code == 'FlashBulky'|| item.courier_code == 'DPFLASHABULKY'|| item.courier_code == 'DPFLASHQBULKY'|| item.courier_code == 'DPFLASHABULKYX'|| item.courier_code == 'DPFLASHLIVEBULKY' || item.courier_code == 'DPFLASHLIVEBULKYX' ){
    //                         courier_name = 'Flash Bulky';
    //                         logo = '../../../express/flash-express-bulky.png'
    //                     }
    //                     if(item.courier_code =='DHL' || item.courier_code =='ISPDHL'|| item.courier_code =='DPDHL'){
    //                         courier_name = 'DHL';
    //                         logo = '../../../express/dhl-express.png'

    //                     }
    //                     if(item.courier_code == 'JntExpress' || item.courier_code == 'ISPJNT'){
    //                         courier_name = 'J&T Express';
    //                         logo = '../../../express/jnt-express.png'

    //                     }
    //                     if(item.courier_code == 'NinjaVan'|| item.courier_code == 'DPNINJA'){
    //                         courier_name = 'NinjaVan';
    //                         logo = '../../../express/ninjavan.png'
    //                     }
    //                     if(item.courier_code == 'ShopeeExpress'|| item.courier_code == 'ISPSPX'|| item.courier_code =='DPSHOPEE'){
    //                         courier_name = 'ShopeeExpress';
    //                         logo = '../../../express/spx.png'
    //                     }
    //                     if(item.courier_code == 'THP_eParcel' || item.courier_code == 'DPTHAIPOST'|| item.courier_code == 'ISPTHP'|| item.courier_code =='THP_eParcelX' || item.courier_code =='ISPTHPX'){
    //                         courier_name = 'ไปรษณีย์ไทย (EMS)';
    //                         logo = '../../../express/THP-eParcel.png'
    //                     }
    //                     if(item.courier_code == 'KerryExpress'|| item.courier_code == 'DPKERRY' || item.courier_code == 'DPKERRYQ' || item.courier_code == 'ISPKEX'|| item.courier_code == 'DPKERRYS' || item.courier_code == 'DPKERRYBULKY'  ){
    //                         courier_name = 'Kerry Express';
    //                         logo = '../../../express/kerry-express.png'
    //                     }
    //                     if(item.courier_code == 'DPBESTEXPRESS' ){
    //                         courier_name = 'Best Express';
    //                         logo = '../../../express/best-express.png'
    //                     }
    //                 }


    //                 if(index == 0){
    //                     recomend = 'border-red';
    //                     recomend_text = `<div class="recomend-text"><span style="color:white">ถูกที่สุด</span></div>`
    //                 }  else{
    //                     recomend = '';
    //                     recomend_text =''
    //                 }     
    //                 let customer_price = parseFloat(item.customer_price)  > 0 ? item.customer_price : item.price ;
    //                 customer_price = parseFloat(customer_price) + parseFloat(item.price_remote);
    //                 let total_price = parseFloat(item.cost) + parseFloat(item.price_remote);
    //                 let check_weight_text_use = parseFloat(item.cost_weight) +  parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger'
    //                 let check_dimension_text_use = 0;

    //                 check_dimension_text_use = parseFloat(item.cost_dimension_percent) +  parseFloat(item.cost_remote) == item.sum_cost ? 'text-success' : 'text-danger'
    //                 if(item.price_policies == 'dimension'){
    //                     check_dimension_text_use = 'text-success'
    //                 }
    //                 if(item.cost_weight == item.cost_dimension_percent){
    //                     check_weight_text_use = 'text-danger';
    //                     check_dimension_text_use = 'text-success'
    //                 }
    //                 if(item.cost_weight == item.cost_dimension){
    //                     check_weight_text_use = 'text-danger';
    //                     check_dimension_text_use = 'text-success'
    //                 }
    //                 if(item.price_policies == 'dimension' && item.dimension_percent != 0){
    //                     check_weight_text_use = 'text-success';
    //                     check_dimension_text_use = 'text-success'

    //                 }
    //                 if(item.message){
    //                    ct = `<div class="card ${recomend}">
    //                         <div class="card-body" style="background:#F2F3F4">
    //                             ${recomend_text}
    //                             <div class="row align-items-center">
    //                                 <div class="col-12 col-md-4">
    //                                     <div class="d-flex justify-content-center">
    //                                         <img src="${logo}"  width="50%" height="50%"/>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-8">
    //                                     <div class="text-center">
    //                                         <span>${item.message}</span><br>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>`;
    //                 }else{
    //                     ct = `<div class="card ${recomend}">
    //                         <div class="card-body">
    //                             ${recomend_text}
    //                             <div class="row align-items-center">
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="d-flex justify-content-center">
    //                                         <img src="${logo}"  width="50%" height="50%"/>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="text-center">
    //                                         <span class="text-secondary">ค่าขนส่ง(น้ำหนัก)</span><br>
    //                                         <strong class="${check_weight_text_use}" style="font-size:16px;"> ${numberWithCommas(item.cost_weight)}</strong>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="text-center">
    //                                         <span class="text-secondary">ค่าขนส่ง(ปริมาตร)</span><br>
    //                                         <strong class=" ${check_dimension_text_use} " style="font-size:16px;"> ${item.cost_dimension_percent != 0 ? numberWithCommas(item.cost_dimension_percent) : numberWithCommas(item.cost_dimension)}</strong>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="text-center">
    //                                         <span class="text-secondary">พื้นที่ห่างไกล/พื้นที่ท่องเที่ยว</span><br>
    //                                         <strong class="" style="font-size:16px; color:gray">${numberWithCommas(item.cost_remote)}</strong>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="text-center">
    //                                         <span class="text-secondary">รวม</span><br>
    //                                         <strong class="text-warning" style="font-size:16px;">ทุน: ${numberWithCommas(item.sum_cost)}</strong><br/>
    //                                         <strong class="text-primary" style="font-size:16px;">ขาย: ${numberWithCommas(customer_price)}</strong><br/>
    //                                         <strong class="text-success" style="font-size:16px;">กำไร: ${numberWithCommas(item.profit)}</strong><br/>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-12 col-md-2">
    //                                     <div class="d-flex justify-content-center">
    //                                         <button class="btn btn-sm btn-primary" onclick="onUseCourier('${item.courier_code}')">ใช้งาน</button>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>`;
    //                 }
    //                 content = content+ct;
    //             })
    //             $('.body-price').append(content)

    //         }
    //     }).fail((res)=>{
    //         toastr['error']('ไม่สามารถตรวจสอบราคาได้กรุณาตรวจสอบข้อมูล', 'ข้อความจากระบบ', {
    //             closeButton: true,
    //             tapToDismiss: false,
    //             rtl: isRtl
    //         });
    //         $('#cover-spin').hide(0)
    //         $('#comparePriceModal').modal('hide');
    //     })
    // }
    function onUseCourier(code) {
        $("#courier_code").val(code).change();
        $('#comparePriceModal').modal('hide');
    }
    $('#bank_id').on('change',function () {
        let customer_id = $('#customer_id').val()
        if(customer_id != null && customer_id != 0){
            $('#save_addressx').prop('checked', true);
        }
    })
    $('#account_name').on('change',function () {
        let customer_id = $('#customer_id').val()
        if(customer_id != null && customer_id != 0){
            $('#save_addressx').prop('checked', true);
        }
    })
    $('#account_number').on('change',function () {
        let customer_id = $('#customer_id').val()
        if(customer_id != null && customer_id != 0){
            $('#save_addressx').prop('checked', true);
        }
    })
    // $('#branch_no').on('change',function () {
    //     let customer_id = $('#customer_id').val()
    //     if(customer_id != null && customer_id != 0){
    //         $('#save_addressx').prop('checked', true);
    //     }
    // })
    function numberWithCommas(x) {
        x = (Math.round(x * 100) / 100).toFixed(2);
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
    function onSelectTracking() {
        $('#selectTracking').modal('show')
    }
    $('#tracking_api_keyword').on('change', function() {
        searchTrackingApi()
    });
    function searchMultiTrackingApi() {
        $('#collapseShowTrackingDetailTable').collapse('show')
        $("#collapseShowTrackingDetail").collapse("hide");
        $('#tracking_input').val('')
        orders = [];
        loadTrackingApiTable()
    }

    let input_tracking_member = document.querySelector('#tracking_input');
    let orders = [];

    if (input_tracking_member) {
        input_tracking_member.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                let search_tracking_member = document.getElementById("search_tracking_member");
                if (search_tracking_member) {
                    search_tracking_member.click();
                }
            }
        });
    }
    function searchTrackingApi() {
        var tracking = $('#tracking_input').val();
        $('#ShowTrackingDetail').empty()
        $('.order_item').prop('checked',false);
        $('#selectAll').prop('checked',false);
        $('#collapseShowTrackingDetailTable').collapse('hide')
        orders = [];
        $.get('/order/get-tracking-api-by-track',{"tracking":tracking}).done((res) => {
            if(res.status){
                $('#card-detail-track').removeClass('d-none')
                $("#collapseShowTrackingDetail").collapse("show");
                let content = ''
                content = ` <div>
                                <span>ชื่อผู้รับ: ${res.data.dst_name} (${res.data.dst_phone})</span><br>
                                <span>ที่อยู่: ${res.data.dst_address} ${res.data.dst_sub_district} ${res.data.dst_district} ${res.data.dst_province} ${res.data.dst_zipcode}</span><br>
                                <span>หมายเหตุ: ${res.data.remark == null ? '-' : res.data.remark} </span>
                            </div>`
                $('#ShowTrackingDetail').append(content)
                $('#tracking_input').focus();
                $('#selectTrackFrom').removeClass('d-none')
                orders.push(res.data.id);
            }else{
                $("#collapseShowTrackingDetail").collapse("show");
                let content = ''
                content = ` <div>
                                <span>${res.message}</span>
                            </div>`
                $('#ShowTrackingDetail').append(content)
                $('#selectTrackFrom').addClass('d-none')
            }
        })

    }
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
    function selectTrackTable(tracking) {
        $('#tracking_input').val(tracking);
        searchTrackingApi()
    }
    $('#selectAll').on('change',function(){
        orders = [];
        if($(this).is(':checked')) {
            $('.order_item').prop('checked',true);
        }else{
            $('.order_item').prop('checked',false);
        }
    });
    function selectCheckboxItem(id) {
        orders = [];
        $.each($("input[name='orders']:checked"), function(){
            let new_val = parseInt($(this).val())
            orders.push(new_val);
        });
    }
    function onSubmitTrackingApi() {
        orders = [];
        $.each($("input[name='orders']:checked"), function(){
            let new_val = parseInt($(this).val())
            orders.push(new_val);
        });
        if(orders.length == 0){
            toastr['error']('กรุณาเลือกรายการ', 'ยังไม่ได้เลือกรายการ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            $('#cover-spin').hide(0)

            return false;
        }
        $("#collapseShowTrackingDetail").collapse("show");
        $('#card-detail-track').addClass('d-none')
    }
    function saveTrackApi(action) {
        $('#cover-spin').show(0)
        let weight = $('#s_weight').val()
        let width = $('#s_width').val()
        let length = $('#s_length').val()
        let height = $('#s_height').val()
        $.get('/order/update-track-api-pacel',{
            "weight":weight,
            "width":width,
            "length":length,
            "height":height,
            "orders":orders
        }).done((res) => {
            $('#cover-spin').hide(0)
            if(res.status){
                toastr['success'](res.message, 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                if(action == 1){
                    loadCartLogs()
                    loadTrackingApiTable()
                    $('#s_weight').val('')
                    $('#s_width').val('')
                    $('#s_length').val('')
                    $('#s_height').val('')
                    $('#s_kg_weight').val('')
                    $('#s_weight').val('')
                    $('#s_weight').val('')
                    $('#tracking_input').val('')
                    orders = [];
                    $("#collapseShowTrackingDetail").collapse("hide");
                    $('#selectTrackFrom').addClass('d-none')

                }
                if(action == 2){
                    loadCartLogs()
                    loadTrackingApiTable()
                }
            }else{
                toastr['error'](res.message, 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                loadCartLogs()
                $('#selectTracking').modal('hide')
                $('#cover-spin').hide(0)

                return false;
            }
        })
    }

    $('#dst_extractor_btn').on('click',function(e) {
        e.preventDefault();
        $('#dstExtractorModal').modal('show')
    })
    function addressDstExtractor() {
        if ($('#origin_dst_address').val() !== "") {
            var origin_address = $('#origin_dst_address').val();
            $.post('/api/normalrize-address', {
                address: origin_address
            }).done((res) => {
                $('#dst_name').val(res.name);
                $('#dst_phone').val(res.phone);
                $('#dst_address').val(res.cut_all);
                $('#dst_sub_district').val(res.sub_district);
                $('#dst_district').val(res.district);
                $('#dst_province').val(res.province);
                $('#dst_zipcode').val(res.zipcode);

                $('#dstExtractorModal').modal('hide');
                $('#origin_dst_address').val('')
                $('.search_result_dst').val(`${res.sub_district} » ${res.district} » ${res.province} » ${res.zipcode}`)
            });
        } else {
            Swal.fire({
                title: 'ข้อความจากระบบ',
                text: 'กรุณาระบุที่อยู่',
                icon: 'error'
            });
        }
    }
    $('#label_extractor_btn').on('click',function(e) {
        e.preventDefault();
        $('#labelExtractorModal').modal('show')
    })
    function addressLabelExtractor() {
        if ($('#origin_label_address').val() !== "") {
            var origin_address = $('#origin_label_address').val();
            $.post('/api/normalrize-address', {
                address: origin_address
            }).done((res) => {
                $('#label_name').val(res.name);
                $('#label_phone').val(res.phone);
                $('#label_address').val(res.cut_all);
                $('#label_sub_district').val(res.sub_district);
                $('#label_district').val(res.district);
                $('#label_province').val(res.province);
                $('#label_zipcode').val(res.zipcode);

                $('#labelExtractorModal').modal('hide');
                $('#origin_label_address').val('')
                $('.thailand_keyword').val(`${res.sub_district} » ${res.district} » ${res.province} » ${res.zipcode}`)
            });
        } else {
            Swal.fire({
                title: 'ข้อความจากระบบ',
                text: 'กรุณาระบุที่อยู่',
                icon: 'error'
            });
        }
    }
    var counter = 0;
    var dynamicInput = [];
    let product_lists = [];
    function onaddProductCod() {
        $('#productCod').modal("show")
        // $('#cod_amount').val(0);
    }
    $('#productCod').on('hidden.bs.modal', function (e) {
        let cod_amount = $(`#cod_amount`).val();
        if(cod_amount == '' || cod_amount == 0){
           $('#cod_amountx').prop('checked',false);
        }
    });
    function addInput(action) {
        if(counter >= 9){
            toastr['error']('เพิ่มสินค้าได้มากสุด 10 รายการ', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        let cod_amount = $(`#cod_amount`).val();
        let pd_name = $(`#pd_name_${counter}`).val();
        let pd_qty = $(`#pd_qty_${counter}`).val();
        let pd_length = $(`#pd_length_${counter}`).val();
        let pd_width = $(`#pd_width_${counter}`).val();
        let pd_height = $(`#pd_height_${counter}`).val();
        let pd_weight = $(`#pd_weight_${counter}`).val();
        let pd_color = $(`#pd_color_${counter}`).val();
        let pd_price = $(`#pd_price_${counter}`).val();
        let pd_index = $(`#pd_index_${counter}`).val();
        let pd_other_color = $(`#pd_other_color_${counter}`).val();
        if(cod_amount == '' || cod_amount == 0){
            toastr['error']('กรุณากรอกยอดเก็บเงินปลายทาง', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_price == ''){
            toastr['error']('กรุณากรอกราคาสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_color == 0){
            toastr['error']('กรุณาระบุสีของสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_color == 'other' && pd_other_color == ''){
            toastr['error']('กรุณาระบุสีของสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_weight == ''){
            toastr['error']('กรุณากรอกน้ำหนักสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_length == ''||pd_width == ''||pd_height == ''){
            toastr['error']('กรุณากรอกขนาดสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_name == ''){
            toastr['error']('กรุณากรอกชื่อสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }
        if(pd_qty == ''){
            toastr['error']('กรุณากรอกจำนวนสินค้า', 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            return false;
        }

        
        var newdiv = document.createElement('div');
        newdiv.innerHTML = `<div class="card" id="dynamicInput[${counter+1}]">
                        <div class="card-body">
                            <div class="card-header d-flex justify-content-end" >
                                <button class="btn btn-sm btn-danger" onclick="removeInput('${counter+1}')">ลบรายการ</button>
                                <input type="text" class="form-control" hidden  name="pd_index_${counter+1}" id="pd_index_${counter+1}"  value="${counter+1}">
                            </div>
                            <div class="row" id="pd_cod" name="pd_cod">
                                <div class="col-4">
                                    <div class="from-group">
                                        <label for="">ชื่อสินค้า<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_name_${counter+1}" id="pd_name_${counter+1}">
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="from-group">
                                        <label for="">ราคา<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_price_${counter+1}" id="pd_price_${counter+1}">
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="from-group">
                                        <label for="">จำนวน<label class="text-danger m-0">*</label></label>
                                        <input type="number" class="form-control" name="pd_qty_${counter+1}" id="pd_qty_${counter+1}">
                                    </div>
                                </div>
                                <div class="col-2">
                                    <div class="from-group">
                                        <label for="">น้ำหนัก(Kg.)<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_weight_${counter+1}" id="pd_weight_${counter+1}">
                                    </div>
                                </div>
                                <div class="col-2">
                                    <div class="from-group">
                                        <label for="">กว้าง<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_width_${counter+1}" id="pd_width_${counter+1}">
                                    </div> 
                                </div>
                                <div class="col-2">
                                    <div class="from-group">
                                        <label for="">ยาว<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_length_${counter+1}" id="pd_length_${counter+1}">
                                    </div>
                                </div>
                                <div class="col-2">
                                    <div class="from-group">
                                        <label for="">สูง<label class="text-danger m-0">*</label></label>
                                        <input type="text" class="form-control" name="pd_height_${counter+1}" id="pd_height_${counter+1}">
                                    </div>
                                </div>

                                <div class="col-2">
                                    <div class="from-group">
                                        <label for="">สี<label class="text-danger m-0">*</label></label>
                                        <select name="pd_color_${counter+1}" id="pd_color_${counter+1}" class="form-control pd_color_${counter+1}" onChange="changeColor(${counter+1})">
                                            <option value="0">กรุณาระบุสี</option>
                                                                                        <option value="other">อื่น ๆ(โปรดระบุ)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-2">
                                    <div class="collapse" id="collapseOtherColor_${counter+1}">
                                        <div class="from-group">
                                            <label for="">สีสินค้า<label class="text-danger m-0">*</label></label>
                                            <input type="text" class="form-control" name="pd_other_color_${counter+1}" id="pd_other_color_${counter+1}" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;

        document.getElementById('formulario').appendChild(newdiv);
        onSaveProductCod(counter)
        counter++;
        if(action == 1){
            $('#productCod').modal("hide")
        }

    }
    function removeInput(id){
        var elem = document.getElementById(`dynamicInput[${id}]`);
        const index = product_lists.findIndex((item) => item.pd_index == id);
        if (index !== -1) {
            product_lists.splice(index, 1);
        }     
        return elem.parentNode.removeChild(elem);
    }
    let ary = [];

    function onSaveProductCod(counter) 
    {
        
        const index = product_lists.findIndex((item) => item.pd_index == counter);
        if (index !== -1) {
            product_lists.splice(index, 1);
        }     
        let pd_name = $(`#pd_name_${counter}`).val();
        let pd_qty = $(`#pd_qty_${counter}`).val();
        let pd_length = $(`#pd_length_${counter}`).val();
        let pd_width = $(`#pd_width_${counter}`).val();
        let pd_height = $(`#pd_height_${counter}`).val();
        let pd_weight = $(`#pd_weight_${counter}`).val();
        let pd_color = $(`#pd_color_${counter}`).val();
        let pd_price = $(`#pd_price_${counter}`).val();
        let pd_index = $(`#pd_index_${counter}`).val();
        let pd_other_color = $(`#pd_other_color_${counter}`).val();
        if(pd_other_color != ''){
            pd_color = pd_other_color
        }
        let product = {
            pd_name : pd_name,
            pd_qty : pd_qty,
            pd_length: pd_length,
            pd_width: pd_width,
            pd_height: pd_height,
            pd_weight : pd_weight,
            pd_color : pd_color,
            pd_price : pd_price,
            pd_index : pd_index,
        }
        if(product_lists == null){
            product_lists = [];
        }
        $(`#pd_name_${counter}`).attr('readonly', true);
        $(`#pd_qty_${counter}`).attr('readonly', true);
        $(`#pd_length_${counter}`).attr('readonly', true);
        $(`#pd_width_${counter}`).attr('readonly', true);
        $(`#pd_height_${counter}`).attr('readonly', true);
        $(`#pd_weight_${counter}`).attr('readonly', true);
        $(`#pd_color_${counter}`).attr('readonly', true);
        $(`#pd_price_${counter}`).attr('readonly', true);
        $(`#pd_price_${counter}`).attr('readonly', true);

        product_lists.push(product);

    }
    function changeColor(id) {
        $(`.pd_other_color_${id}`).val('')
        if ($(`#pd_color_${id}`).val() == 'other'){
            $(`#collapseOtherColor_${id}`).collapse('show')
        }else{
            $(`#collapseOtherColor_${id}`).collapse('hide')
        } 
    }
    function alertClose(){
        Swal.fire({
            title: 'ข้อความจากระบบ',
            text: 'กรุณาตรวจสอบข้อมูลสินค้าและกดบันทึกก่อนปิดหน้าต่างนี้',
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: 'ตกลง',
            denyButtonText: 'ปิดหน้าต่างนี้',
            allowOutsideClick: false
        })
        .then((result) => {
            if (!result.isConfirmed) {
                $('#productCod').modal("hide")
            }
        });
    }
    let input_tracking_pre_barcode = document.querySelector('#pre_barcode_track');
    if (input_tracking_pre_barcode) {
        input_tracking_pre_barcode.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                let search_tracking_member = document.getElementById("search_tracking_member");
                if (search_tracking_member) {
                    search_tracking_member.click();
                }
            }
        });
    }
    function searchTrackingPreBarcode() {
        let track_pore_barcode = $('#pre_barcode_track').val();
        $('#pre_barcode_track').prop('readOnly', true);
        $.get('/order/check-pre-barcode', {
            track_no: track_pore_barcode
        }).done((res) => {
            if(!res.status){
                $('#pre_barcode_track').prop('readOnly', false);
                if(res.code == 222){
                    $('#pre_barcode_track').val("");
                }
                toastr['error'](res.message, 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                return false;
            }
            
            $('#pre_barcode_track').prop('readOnly', false);
            toastr['success'](res.message, 'ข้อความจากระบบ', {
                closeButton: true,
                tapToDismiss: false,
                rtl: isRtl
            });
            
        })
    }
    function previewInsurance() {
        $.get('/get-condition').done((res) => {
            if(res){
                $('#insuranceConditionModal').modal('show')
                if(res.insurance_conditions != null){
                    $('#insurance_condition').html(`${res.insurance_conditions}`);
                }
            }

        })
    }
    function previewBoxshield() {
        $.get('/get-condition').done((res) => {
            if(res){
                $('#boxshieldConditionModal').modal('show')
                if(res.boxshield_conditions != null){
                    $('#boxshield_condition').html(`${res.boxshield_conditions}`);
                }
            }
        })
    }
    function previewCondition() {
        let courier_code = $('#courier_code').val()
        $('#conditions').empty()
        $.get('/get-courier-condition', {
            "courier_code": courier_code
        }).done((res) => {
            if(res.status){
                $('#ConditionModal').modal('show')
                if(res.data.conditions != null){
                    $('#conditions').html(`${res.data.conditions}`);
                }
            }

        })
    }
    function onRemoveDuplicate() {
        $.get('/order/remove-duplicate-order-log').done((res) => {
            if (res.status) {
                toastr['success']('เคลียร์รายการซ้ำสำเร็จ', 'ข้อความจากระบบ', {
                    closeButton: true,
                    tapToDismiss: false,
                    rtl: isRtl
                });
                loadCartLogs()
                calculateSummary()
            }
        })
    }
    function onLockDstl(action) {
        if(action == 1){
            $('.icon-dst-lock').removeClass('d-none')
            $('.icon-dst-unlock').addClass('d-none')
            lock_dst = 1
        }else{
            $('.icon-dst-unlock').removeClass('d-none')
            $('.icon-dst-lock').addClass('d-none')
            lock_dst = 0
        }
    }
    function saveAndPrint(size) {
        save_print = 1;
        print_size = size;
        $('#cover-spin').show(0)

        createOrderForm()
        
    }
    $('#discount_type').on('change',function () {
       calculateSummary()
    })
    $('#discount_value').on('change',function () {
       calculateSummary()
    })
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
    function clearInputLabel() {
        $('.thailand_keyword').val('')
        $('#label_sub_district').val('')
        $('#label_district').val('')
        $('#label_province').val('')
        $('#label_zipcode').val('')
        $('.thailand_keyword').prop('readonly', false);
    }
    function clearInputDst() {
        $('.search_result_dst').val('')
        $('#dst_sub_district').val('');
        $('#dst_district').val('');
        $('#dst_province').val('');
        $('#dst_zipcode').val('');
        $('.search_result_dst').prop('disabled', false);
    }


var user_config_camera = user_camera_device;
$(document).on('keydown', async function (e) {
  let target = $(e.target);
  const key = target.data('key');
  const priority = ['weight', 'width', 'length', 'height'];

  if (!user_camera) return;
  if (e.which != 13) return; 
  if (!target.is('input[data-key]')) return;
  if (!priority.includes(key)) return;
  if (!target.val()?.trim()) {
    toastr['warning']('กรุณาระบุข้อมูล', 'ข้อความจากระบบ', {
            closeButton: true,
            tapToDismiss: false,
            rtl: isRtl
        });
    return;
  }

  if (e.which == 13) {
    e.preventDefault();
    try {
        configCamera();

    } catch (err) {
      alert('เปิดกล้องไม่ได้', err);
    }
  }
});


$(document).on('click', '.camera-tag', function () {
  if (!user_camera) return;
  const key = $(this).data('key'); 
  const input = $('input[data-key="'+key+'"]');

  if (!input.val()?.trim()) {
    toastr['warning']('กรุณาระบุข้อมูล', 'ข้อความจากระบบ', {
            closeButton: true,
            tapToDismiss: false,
            rtl: isRtl
        });
    return;
  }  
  input.focus();
  configCamera();
});



async function configCamera()
{
    await navigator.mediaDevices.getUserMedia({ video: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(value => value.kind == 'videoinput');
    const camera_checker = cameras.some(item => item.deviceId == user_config_camera);
    $('.zoom-btn').removeClass('active');
    $('.zoom-btn[data-zoom="1"]').trigger('click');
    previewZoom();
    if (!camera_checker) {
        swal.fire({
            'title' : 'ระบบแจ้งเตือน',
            'html' : 'ไม่พบอุปกรณ์ที่เคยจำในระบบ <br> โปรดตั้งค่าอุปกรณ์ใหม่ในการดำเนินการต่อ',
            'icon' :'warning',
            allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/user/webcam'; 
                }
            });
    
    } else {
        $('#cover-spin').show(0);
            const use_camera = await navigator.mediaDevices.getUserMedia({
                                video: {
                                deviceId: { exact: user_config_camera }
                                }
                            });
                config_camera = use_camera;
        const video = $('#cameraVideo')[0];
        video.srcObject = use_camera;
        $('#camera_datetime').text(formatDateTime());
        $('#cameraModal').modal('show');
        // $('#camera_weight').text('น้ำหนัก: ' + ($('#kg_weight').val() || '-') + ' kg');
        video.onloadedmetadata = function () {
            $('#cover-spin').hide(0);
        };

    }
}

function formatDateTime(images_zip = null) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

   let format = '';
    if (images_zip == null) {
        format = `${day}/${month}/${year} ${hour}:${min}:${sec}`;
    } else {
        if (images_zip) {
             format = `${day}_${month}_${year}_${hour}_${min}_${sec}`;
        }
    }

    return format;
  
}

var shutter_audio = null;
async function preloadShutterSound() {
  const res = await fetch('/sounds/iphone_shutter.mp3');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  shutter_audio = new Audio(url);
  shutter_audio.volume = 1;
}

$('#cameraModal').on('shown.bs.modal', async function () {
  await preloadShutterSound();
  $('#camera_datetime').text(formatDateTime());
  camera_timer = setInterval(() => {
    $('#camera_datetime').text(formatDateTime());
  }, 1000);
});

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = 900;
  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

function playMacShutter() {
  return new Promise((resolve) => {
    if (!shutter_audio) {
      resolve();
      return;
    }
    shutter_audio.currentTime = 0;
    shutter_audio.onended = () => {
      resolve(); 
    };

    shutter_audio.play().catch(err => {
      resolve(); 
    });
  });
}

var countdown_timer = null;
async function startCountdown(sec = 5) {
  let count = sec;
  $('#cameraCountdown').removeClass('d-none').text(count);
    playBeep();
  countdown_timer = setInterval(async () => {
    count--;
    if (count <= 0) {
      clearInterval(countdown_timer);
      countdown_timer = null;
      $('#cameraCountdown').addClass('d-none');
      takePhotoNow();
      await playMacShutter();
      cursorChecker(current_photo_key);
      camera_action_lock = false; 
    } 
    else {
      $('#cameraCountdown').text(count);
      playBeep();
    }

  }, 1000);
}

var take_images_current_time = {};
async function takePhotoNow() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

const vw = video.videoWidth;
const vh = video.videoHeight;

// คำนวณ crop ตรงกลาง (เหมือน Android)
const cropW = vw / camera_zoom;
const cropH = vh / camera_zoom;
const cropX = (vw - cropW) / 2;
const cropY = (vh - cropH) / 2;

canvas.width = vw;
canvas.height = vh;

ctx.drawImage(
    video,
    cropX, cropY, cropW, cropH, // ตัดภาพ
    0, 0, canvas.width, canvas.height // ขยายเต็ม
);

//   const headerHeight = 60;
//   ctx.fillStyle = 'rgba(0,0,0,0.85)';
//   ctx.fillRect(0, 0, canvas.width, headerHeight);
//   ctx.fillStyle = '#fff';
//   ctx.font = '20px sans-serif';
//   ctx.textBaseline = 'middle';
  const key = $('#current_input').text().trim();
  const datetime = document.getElementById('camera_datetime').innerText.trim();
  take_images_current_time[key] = datetime;

//const weight = document.getElementById('camera_weight').innerText;
//   ctx.fillText(datetime, 16, headerHeight / 2);
//   ctx.textAlign = 'right';
//   ctx.fillText(weight, canvas.width - 16, headerHeight / 2);
//   ctx.textAlign = 'left';

  const imageDataUrl = canvas.toDataURL('image/png');
  if (current_photo_key) {
    document.getElementById(`photo_${current_photo_key}`).src = imageDataUrl;
    const box = $('.photo-box[data-key="'+key+'"]');
    const img = box.find('img');
    box.addClass('has-image');
  }
  await showCaptureEffect(imageDataUrl);
    setTimeout(() => {
        $('#cameraModal').modal('hide');
    }, 1900);
}

var camera_action_lock = false;
$(document).on('keydown', async function (e) {
  if (!$('#cameraModal').hasClass('show')) return;
  if (camera_action_lock) return;
  if (e.which == 13) {
    e.preventDefault();
    camera_action_lock = true; 
    takePhotoNow();
    await playMacShutter();   
    cursorChecker(current_photo_key);
    camera_action_lock = false;
  } else if (e.which == 32) {
    e.preventDefault();
    if (countdown_timer) return;
    camera_action_lock = true; 
    startCountdown(camera_timer_seconds);
  }

    if(!show_images) {
        $('#dimension-images').removeClass('d-none').hide().fadeIn(300);
        show_images = true;
    }

    const count = $('.photo-box img[src]').length;
    if (count == 4) {
        $('.photo-box').removeClass('active');
    } 
});

async function showCaptureEffect(imageDataUrl) {
  const overlay = document.getElementById('miniCaptureOverlay');
  overlay.style.backgroundImage = `url(${imageDataUrl})`;
  overlay.classList.remove('show', 'flash');
  overlay.offsetHeight;
  overlay.classList.add('show');
  setTimeout(() => {
    overlay.classList.add('flash');
  }, 60);

  setTimeout(() => {
    overlay.classList.remove('flash');
  }, 160);

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 900);

  setTimeout(() => {
    overlay.style.backgroundImage = '';
  }, 1300);
}

$(document).on('focus', 'input[data-key]', function () {
  current_photo_key = this.dataset.key;
  $('#current_input').empty();
  $('#current_input').text(current_photo_key);
  $('.photo-box').removeClass('active');
  $(`.photo-box[data-key="${current_photo_key}"]`).addClass('active');
});

var priority = ['weight', 'width', 'length', 'height'];
var focus_lock = false;
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

function hardFocus($el, retry = 10) {
    if (!$el || !$el.length) return;
    if ($el.is(':disabled') || !$el.is(':visible')) return;
    if (focus_lock) return;

    focus_lock = true;
    const el = $el[0];

    const tryFocus = () => {
        el.focus({ preventScroll: true });
        el.select && el.select();

        if (document.activeElement == el) {
            focus_lock = false; 
            return;
        }

        if (retry > 0) {
            retry--;
            setTimeout(tryFocus, 20); 
        } else {
            focus_lock = false; 
        }
    };

    Promise.resolve().then(() => {
        requestAnimationFrame(tryFocus);
    });
}


function setActivePhoto(key) {
  $('.photo-box').removeClass('active');
  $('.photo-box[data-key="' + key + '"]').addClass('active');
}

async function setCameraZoom(zoomLevel) {
    if (!config_camera) return;

    const track = config_camera.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (!capabilities.zoom) {
        console.warn('Camera does not support zoom');
        return;
    }

    const min = capabilities.zoom.min;
    const max = capabilities.zoom.max;

    const zoom = Math.min(Math.max(zoomLevel, min), max);

    await track.applyConstraints({
        advanced: [{ zoom }]
    });
}

$(document).on('click', '.zoom-btn', function () {
    camera_zoom = Number($(this).data('zoom'));

    $('.zoom-btn').removeClass('active');
    $(this).addClass('active');
     previewZoom();
});


function previewZoom() {
    $('#cameraVideo').css({
        transform: `scale(${camera_zoom})`,
        transformOrigin: 'center center'
    });
}

$('#timerToggle').on('click', function (e) {
    e.stopPropagation();
    $('#timerMenu').toggleClass('show');
});

$('.timer-option').on('click', function () {
    camera_timer_seconds = Number($(this).data('time'));

    $('.timer-option').removeClass('active');
    $(this).addClass('active');

    $('#timerMenu').removeClass('show');
});

$(document).on('click', function () {
    $('#timerMenu').removeClass('show');
});

$(document).on('click', '.photo-remove', function () {
    const $box = $(this).closest('.photo-box');

    $box.find('img').attr('src', '');
    $box.removeClass('has-image');
});

$('#dimension-images').on('click','.photo-box, .photo-box img, .photo-box .no-photo',
    function (e) {
        e.preventDefault();
        const key = $(this).closest('.photo-box').data('key');
        const input = $('input[data-key="'+key+'"]');
        if (input.length) {
            setActivePhoto(key);
            input.focus().select();
        }
    }
);

var checking_payment = false;
var check_xhr = null;
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

let timer = null;
let timeLeft = 0;
function startCounter(minutes = 10) {
    if (timer) return; 

    const display = document.getElementById('timer');
    if (!display) return;

    timeLeft = minutes * 60;
    updateTime(display);

    timer = setInterval(() => {
        timeLeft--;

        if (timeLeft < 0) {
            stopCounter();
            onTimeUp();
            return;
        }

        updateTime(display);
    }, 1000);
}

function stopCounter() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTime(el) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    el.textContent =
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
}

function onTimeUp() {
    $('#paymentQrCode').modal('hide');
    Swal.fire({
        title: 'ระบบแจ้งเตือน',
        text: 'หมดเวลาทำรายการ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        $('#selectPrice').modal('show');
    });
}

$('#paymentQrCode')
    .off('shown.bs.modal hidden.bs.modal')
    .on('shown.bs.modal', function () {
        $('#cancel-button').prop('disabled', false);
        $('#qr-code-loading').addClass('d-none');
        startCounter(); 
    })
    .on('hidden.bs.modal', function () {
        stopCounter();
    });

function downloadQr() {
    const img = document.getElementById('image-qr-code');

    if (!img || !img.src) {
        alert('ไม่พบ QR Code');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.crossOrigin = 'anonymous';
    image.src = img.src;

    image.onload = function () {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const png_url = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        link.href = png_url;
        link.download = 'payment_qr_' + Date.now() + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    image.onerror = function () {
        alert('ไม่สามารถดาวน์โหลด QR Code ได้');
    };
}

$(document).on('click', '.change-price', function () {
    $('#selectPrice').modal('show');
    $('#paymentQrCode').modal('hide');
});



// $(document).on('click', '.confirm-transfer', function () {
//     stopCounter();
//     const btn = $(this);
//     const btn_change_price = $('.change-price');
//     const loading = $('#qr-code-loading');

//     if (btn.prop('disabled')) return;
//         btn.prop('disabled', true);
//         btn.find('.btn-text').addClass('d-none');
//         btn.find('.btn-loading').removeClass('d-none');

//         btn_change_price.prop('disabled', true);
//         loading.removeClass('d-none');

//        checkCallBackQrcode($('#txn_id').val())
//         .then((res) => {
//             if (res.status) {
//                 setTimeout(() => {
//                     $.get('/still-alive').done(res => {
//                         $('.user-credit').text(`เครดิต : ${res.credits}`);
//                     });
//                 }, 1500);
//                 toastr['success'](res.message, 'ระบบแจ้งเตือน', {
//                     closeButton: true,
//                     tapToDismiss: false,
//                     rtl: isRtl
//                 });
//                 $('#paymentQrCode').modal('hide');
//             } else {
//                 toastr['error'](res.message, 'ระบบแจ้งเตือน', {
//                     closeButton: true,
//                     tapToDismiss: false,
//                     rtl: isRtl
//                 });
//                 $('#paymentQrCode').modal('hide');
//             }
//         })
//         .catch((err) => {
//             alert('เกิดข้อผิดพลาด');
//             $('#paymentQrCode').modal('hide');
//             console.error(err);
//         })
//         .finally(() => {
//             btn_change_price.prop('disabled', false);
//             btn.prop('disabled', false).html('<i data-feather="check-circle"></i> โอนแล้ว');
//             $('#paymentQrCode').modal('hide');
//             feather.replace();
//         }); 

// });


$(document).on('click', '.confirm-transfer', function () {

    if (checking_payment) return; 
    stopCounter();

    const btn = $(this);
    const btn_change_price = $('.change-price');

    checking_payment = true;

    btn.prop('disabled', true);
    btn.find('.btn-text').addClass('d-none');
    btn.find('.btn-loading').removeClass('d-none');

    btn_change_price.prop('disabled', true);
    $('#qr-code-loading').removeClass('d-none');

    setTimeout(() => {
        checkCallBackQrcode($('#txn_id').val());
    }, 3000); 
});

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




// === INLINE SCRIPT 4 ===


        window.translations = {"auth":{"failed":"These credentials do not match our records.","password":"The provided password is incorrect.","throttle":"Too many login attempts. Please try again in :seconds seconds."},"common":{"submit":"\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01","search":"\u0e04\u0e49\u0e19\u0e2b\u0e32","date":"\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48","to":"\u0e16\u0e36\u0e07","edit":"\u0e41\u0e01\u0e49\u0e44\u0e02","cancel":"\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01","close":"\u0e1b\u0e34\u0e14","section":"\u0e2b\u0e31\u0e27\u0e02\u0e49\u0e2d","remove":"\u0e25\u0e1a","not_found":"\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25"},"pagination":{"previous":"\u0026laquo; Previous","next":"Next \u0026raquo;"},"passwords":{"reset":"Your password has been reset!","sent":"We have emailed your password reset link!","throttled":"Please wait before retrying.","token":"This password reset token is invalid.","user":"We can\u0027t find a user with that email address."},"translation":{"menu":"\u0e40\u0e21\u0e19\u0e39","dashboards":"\u0e20\u0e32\u0e1e\u0e23\u0e27\u0e21","credit":"\u0e40\u0e04\u0e23\u0e14\u0e34\u0e15","address":"\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48","dropoff-address":"\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e23\u0e49\u0e32\u0e19","dst-address":"\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e1c\u0e39\u0e49\u0e23\u0e31\u0e1a","create-orders":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1e\u0e31\u0e2a\u0e14\u0e38","orders":"\u0e43\u0e1a\u0e2a\u0e31\u0e48\u0e07\u0e0b\u0e37\u0e49\u0e2d","live":"\u0e44\u0e25\u0e1f\u0e4c","chats":"\u0e41\u0e0a\u0e17","settings":"\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32\u0e23\u0e30\u0e1a\u0e1a","customers":"\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32","warehouse":"\u0e04\u0e25\u0e31\u0e07\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","shop-setting":"\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32","shipping-setting":"\u0e02\u0e19\u0e2a\u0e48\u0e07","payment-setting":"\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19","employees-setting":"\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19","api-setting":"\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e15\u0e48\u0e2d\u0e1c\u0e48\u0e32\u0e19 api","help":"\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d","balance":"\u0e04\u0e07\u0e40\u0e2b\u0e25\u0e37\u0e2d","logout":"\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a","prices":"\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32\u0e23\u0e32\u0e04\u0e32\u0e2b\u0e19\u0e49\u0e32\u0e23\u0e49\u0e32\u0e19","member":"\u0e2a\u0e21\u0e32\u0e0a\u0e34\u0e01","topup":"\u0e40\u0e15\u0e34\u0e21\u0e40\u0e07\u0e34\u0e19","topup_report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e40\u0e15\u0e34\u0e21\u0e40\u0e07\u0e34\u0e19","product":"\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19","shipping_list":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1e\u0e31\u0e2a\u0e14\u0e38","bill_list":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08","courier_log":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e01\u0e23\u0e16\u0e40\u0e02\u0e49\u0e32\u0e23\u0e31\u0e1a","credit_report":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e40\u0e04\u0e23\u0e14\u0e34\u0e15","profit_report":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e01\u0e33\u0e44\u0e23 - \u0e02\u0e32\u0e14\u0e17\u0e38\u0e19","cod_report":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e42\u0e2d\u0e19 COD","profile":"\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19","claim":"\u0e40\u0e04\u0e25\u0e21\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","claim_list":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e40\u0e04\u0e25\u0e21\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","create_claim":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e40\u0e04\u0e25\u0e21\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","setting":"\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32\u0e23\u0e30\u0e1a\u0e1a","import_data":"\u0e19\u0e33\u0e40\u0e02\u0e49\u0e32\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25","report_product":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e02\u0e32\u0e22\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","news":"\u0e02\u0e48\u0e32\u0e27\u0e2a\u0e32\u0e23","employee":"\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19","price_table":"\u0e15\u0e32\u0e23\u0e32\u0e07\u0e23\u0e32\u0e04\u0e32","diff_price_report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e01\u0e40\u0e01\u0e47\u0e1a\u0e40\u0e07\u0e34\u0e19\u0e40\u0e1e\u0e34\u0e48\u0e21","wait_cod":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e23\u0e2d\u0e42\u0e2d\u0e19 COD","manage-orders":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e43\u0e1a\u0e2a\u0e48\u0e07\u0e1e\u0e31\u0e2a\u0e14\u0e38","track":"\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38","pre-barcode":"Pre Barcode","bill-service":"\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e1a\u0e34\u0e25","report_bill_service":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e1a\u0e34\u0e25","lazada":"\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e15\u0e31\u0e27\u0e41\u0e17\u0e19 Drop off Lazada","dropoff-kex":"KEX","dropoff_create":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23","dropoff_report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19","dropoff_track":"\u0e19\u0e33\u0e40\u0e02\u0e49\u0e32\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38 Dropoff","dropoff_report_track":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38 Dropoff","webhook":"\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23 Webhook","point":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e43\u0e0a\u0e49 Point","rewards":"\u0e41\u0e25\u0e01\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25","claims":"\u0e2a\u0e34\u0e17\u0e18\u0e34\u0e4c","reward_points":"\u0e04\u0e30\u0e41\u0e19\u0e19\u0e2a\u0e30\u0e2a\u0e21","redemption_history":"\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e41\u0e25\u0e01","recent_posts":"\u0e01\u0e23\u0e30\u0e17\u0e39\u0e49\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14","categories":"\u0e2b\u0e21\u0e27\u0e14\u0e2b\u0e21\u0e39\u0e48","all":"\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14","food":"\u0e2d\u0e32\u0e2b\u0e32\u0e23","fashion":"\u0e41\u0e1f\u0e0a\u0e31\u0e48\u0e19","gadget":"\u0e41\u0e01\u0e14\u0e40\u0e08\u0e47\u0e15","voucher":"\u0e27\u0e2d\u0e19\u0e40\u0e0a\u0e2d\u0e23\u0e4c","rewards_list":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e02\u0e2d\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25","address_detail":"\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48","check_verify":"** \u0e01\u0e23\u0e38\u0e13\u0e32\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e43\u0e19\u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e2a\u0e48\u0e07\u0e43\u0e2b\u0e49\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e01\u0e32\u0e23\u0e41\u0e25\u0e01\u0e02\u0e2d\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25","remark_title":"\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e2b\u0e15\u0e38 (\u0e44\u0e21\u0e48\u0e08\u0e33\u0e40\u0e1b\u0e47\u0e19)","redemption-history":"\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e01\u0e32\u0e23\u0e41\u0e25\u0e01\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25","shipped":"\u0e2a\u0e48\u0e07\u0e02\u0e2d\u0e07\u0e41\u0e25\u0e49\u0e27","created_at":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48","image":"\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e","status":"\u0e2a\u0e16\u0e32\u0e19\u0e30","tracking_number":"\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38","remark":"\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e2b\u0e15\u0e38","pending":"\u0e23\u0e2d\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23","refund_report":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e37\u0e19\u0e40\u0e07\u0e34\u0e19","track_no":"\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38","amount":"\u0e08\u0e33\u0e19\u0e27\u0e19","identification":"\u0e01\u0e32\u0e23\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e15\u0e31\u0e27\u0e15\u0e19","date_return":"\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e04\u0e37\u0e19","difference":"\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e48\u0e32\u0e07","price_before":"\u0e23\u0e32\u0e04\u0e32\u0e01\u0e48\u0e2d\u0e19","price_after":"\u0e23\u0e32\u0e04\u0e32\u0e2b\u0e25\u0e31\u0e07","wefast-x":"\u0e02\u0e19\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28 WefastX","international_shipping":"\u0e1e\u0e31\u0e2a\u0e14\u0e38\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28(\u0e1b\u0e13.)","menu_create_order":"\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23","selected_courier":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e40\u0e25\u0e02\u0e1e\u0e31\u0e2a\u0e14\u0e38\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","management":"\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23","inter-shipping-setting":"\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32\u0e23\u0e32\u0e04\u0e32\u0e02\u0e19\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","validate_addition":"\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e44\u0e21\u0e48\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07 \u0e1f\u0e34\u0e25\u0e14\u0e4c\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e15\u0e34\u0e21 (\u0e1c\u0e39\u0e49\u0e23\u0e31\u0e1a) \u0e08\u0e30\u0e15\u0e49\u0e2d\u0e07\u0e21\u0e35\u0e04\u0e27\u0e32\u0e21\u0e22\u0e32\u0e27\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14 50 \u0e15\u0e31\u0e27\u0e2d\u0e31\u0e01\u0e29\u0e23","validate_hs_code":"\u0e23\u0e2b\u0e31\u0e2a\u0e40\u0e25\u0e02\u0e28\u0e38\u0e25\u0e01\u0e32\u0e01\u0e23\u0e44\u0e21\u0e48\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07\u0e04\u0e27\u0e32\u0e21\u0e22\u0e32\u0e27\u0e23\u0e2b\u0e31\u0e2a\u0e40\u0e25\u0e02\u0e28\u0e38\u0e25\u0e01\u0e32\u0e01\u0e23\u0e15\u0e49\u0e2d\u0e07\u0e40\u0e1b\u0e47\u0e19 6, 8 \u0e2b\u0e23\u0e37\u0e2d 10 \u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e23\u0e2b\u0e31\u0e2a\u0e40\u0e25\u0e02\u0e28\u0e38\u0e25\u0e01\u0e32\u0e01\u0e23\u0e17\u0e35\u0e48: https:\/\/www.wcotradetools.org\/en\/harmonized-system, \u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e23\u0e39\u0e1b\u0e41\u0e1a\u0e1a\u0e17\u0e35\u0e48 : https:\/\/dpostinter.thailandpost.com\/sample\/ManualDpostInterFormat.pdf","lazada-packs":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e22\u0e2d\u0e14\u0e41\u0e1e\u0e47\u0e04 Lazada","inter_bill_list":"\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e43\u0e1a\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","inter-parcel-report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e01\u0e33\u0e44\u0e23 - \u0e02\u0e32\u0e14\u0e17\u0e38\u0e19","inter-return-rate":"\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32\u0e23\u0e32\u0e04\u0e32\u0e04\u0e48\u0e32\u0e15\u0e35\u0e01\u0e25\u0e31\u0e1a\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","inter-check-price":"\u0e40\u0e0a\u0e47\u0e04\u0e23\u0e32\u0e04\u0e32\u0e02\u0e19\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","lazada-report":"\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e22\u0e2d\u0e14 Lazada","contract_admin":"\u0e41\u0e2a\u0e14\u0e07\u0e04\u0e27\u0e32\u0e21\u0e04\u0e34\u0e14\u0e40\u0e2b\u0e47\u0e19","order_product":"\u0e2a\u0e31\u0e48\u0e07\u0e0b\u0e37\u0e49\u0e2d\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32","inter-conditions":"*\u0e40\u0e07\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e02\u0e02\u0e19\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28","shopchill":"Shopchill Dropoff","service":"\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e40\u0e2a\u0e23\u0e34\u0e21","joybox":"\u0e02\u0e32\u0e22\u0e02\u0e2d\u0e07"},"validation":{"accepted":"The :attribute must be accepted.","accepted_if":"The :attribute must be accepted when :other is :value.","active_url":"The :attribute is not a valid URL.","after":"The :attribute must be a date after :date.","after_or_equal":"The :attribute must be a date after or equal to :date.","alpha":"The :attribute must only contain letters.","alpha_dash":"The :attribute must only contain letters, numbers, dashes and underscores.","alpha_num":"The :attribute must only contain letters and numbers.","array":"The :attribute must be an array.","before":"The :attribute must be a date before :date.","before_or_equal":"The :attribute must be a date before or equal to :date.","between":{"array":"The :attribute must have between :min and :max items.","file":"The :attribute must be between :min and :max kilobytes.","numeric":"The :attribute must be between :min and :max.","string":"The :attribute must be between :min and :max characters."},"boolean":"The :attribute field must be true or false.","confirmed":"The :attribute confirmation does not match.","current_password":"The password is incorrect.","date":"The :attribute is not a valid date.","date_equals":"The :attribute must be a date equal to :date.","date_format":"The :attribute does not match the format :format.","declined":"The :attribute must be declined.","declined_if":"The :attribute must be declined when :other is :value.","different":"The :attribute and :other must be different.","digits":"The :attribute must be :digits digits.","digits_between":"The :attribute must be between :min and :max digits.","dimensions":"The :attribute has invalid image dimensions.","distinct":"The :attribute field has a duplicate value.","email":"The :attribute must be a valid email address.","ends_with":"The :attribute must end with one of the following: :values.","enum":"The selected :attribute is invalid.","exists":"The selected :attribute is invalid.","file":"The :attribute must be a file.","filled":"The :attribute field must have a value.","gt":{"array":"The :attribute must have more than :value items.","file":"The :attribute must be greater than :value kilobytes.","numeric":"The :attribute must be greater than :value.","string":"The :attribute must be greater than :value characters."},"gte":{"array":"The :attribute must have :value items or more.","file":"The :attribute must be greater than or equal to :value kilobytes.","numeric":"The :attribute must be greater than or equal to :value.","string":"The :attribute must be greater than or equal to :value characters."},"image":"The :attribute must be an image.","in":"The selected :attribute is invalid.","in_array":"The :attribute field does not exist in :other.","integer":"The :attribute must be an integer.","ip":"The :attribute must be a valid IP address.","ipv4":"The :attribute must be a valid IPv4 address.","ipv6":"The :attribute must be a valid IPv6 address.","json":"The :attribute must be a valid JSON string.","lt":{"array":"The :attribute must have less than :value items.","file":"The :attribute must be less than :value kilobytes.","numeric":"The :attribute must be less than :value.","string":"The :attribute must be less than :value characters."},"lte":{"array":"The :attribute must not have more than :value items.","file":"The :attribute must be less than or equal to :value kilobytes.","numeric":"The :attribute must be less than or equal to :value.","string":"The :attribute must be less than or equal to :value characters."},"mac_address":"The :attribute must be a valid MAC address.","max":{"array":"The :attribute must not have more than :max items.","file":"The :attribute must not be greater than :max kilobytes.","numeric":"The :attribute must not be greater than :max.","string":"The :attribute must not be greater than :max characters."},"mimes":"The :attribute must be a file of type: :values.","mimetypes":"The :attribute must be a file of type: :values.","min":{"array":"The :attribute must have at least :min items.","file":"The :attribute must be at least :min kilobytes.","numeric":"The :attribute must be at least :min.","string":"The :attribute must be at least :min characters."},"multiple_of":"The :attribute must be a multiple of :value.","not_in":"The selected :attribute is invalid.","not_regex":"The :attribute format is invalid.","numeric":"The :attribute must be a number.","password":{"letters":"The :attribute must contain at least one letter.","mixed":"The :attribute must contain at least one uppercase and one lowercase letter.","numbers":"The :attribute must contain at least one number.","symbols":"The :attribute must contain at least one symbol.","uncompromised":"The given :attribute has appeared in a data leak. Please choose a different :attribute."},"present":"The :attribute field must be present.","prohibited":"The :attribute field is prohibited.","prohibited_if":"The :attribute field is prohibited when :other is :value.","prohibited_unless":"The :attribute field is prohibited unless :other is in :values.","prohibits":"The :attribute field prohibits :other from being present.","regex":"The :attribute format is invalid.","required":"The :attribute field is required.","required_array_keys":"The :attribute field must contain entries for: :values.","required_if":"The :attribute field is required when :other is :value.","required_unless":"The :attribute field is required unless :other is in :values.","required_with":"The :attribute field is required when :values is present.","required_with_all":"The :attribute field is required when :values are present.","required_without":"The :attribute field is required when :values is not present.","required_without_all":"The :attribute field is required when none of :values are present.","same":"The :attribute and :other must match.","size":{"array":"The :attribute must contain :size items.","file":"The :attribute must be :size kilobytes.","numeric":"The :attribute must be :size.","string":"The :attribute must be :size characters."},"starts_with":"The :attribute must start with one of the following: :values.","doesnt_start_with":"The :attribute may not start with one of the following: :values.","string":"The :attribute must be a string.","timezone":"The :attribute must be a valid timezone.","unique":"The :attribute has already been taken.","uploaded":"The :attribute failed to upload.","url":"The :attribute must be a valid URL.","uuid":"The :attribute must be a valid UUID.","custom":{"attribute-name":{"rule-name":"custom-message"}},"attributes":[]}};
        window.locale = "th";
        const user_verify = Number('0');
        const current_path = window.location.pathname;
        let approve_policies = '1';
        var remark = "";
        if ((user_verify == 2 || user_verify == 3) && (current_path !== '/user/profile')) {
            $('#page-activate').block({
                message: `<div style="display: flex; align-items: center; justify-content: center;">
                            <i data-feather="alert-circle" style="margin-right: 10px; stroke-width: 2;"></i>
                            <span>โปรดยืนยันตัวตนของบัญชีผู้ใช้งาน</span>
                        </div>${user_verify == 2  ? '<br> อยู่ระหว่างการตรวจสอบ..' : ''}`,
                css: {
                    border: '1px solid #ccc',
                    padding: '15px 25px',
                    backgroundColor: '#f9f9f9',
                    '-webkit-border-radius': '8px',
                    '-moz-border-radius': '8px',
                    borderRadius: '8px',
                    opacity: 0.95,
                    color: '#333',
                    fontSize: '14px',
                    cursor: 'default',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1001,
                    width: '80%',
                    top: '30%',
                    left: '10%',
                    textAlign: 'center'
                },
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: 0.25,
                    cursor: 'wait',
                    zIndex: 1000
                }
            });
           
            if (user_verify == 3) {
                Swal.fire({
                    title: 'โปรดยืนยันตัวตนของบัญชีผู้ใช้งาน',
                    html: 'ส่งข้อมูลเพื่อยืนยันตัวตน <br>'+'<strong class="text-danger">'+(remark == null ? '' : remark)+'<strong>',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'ตกลง',
                }).then((click) => {
                    if (click.isConfirmed) {
                        if (user_verify == 3) {
                            window.location.href = '/user/profile';
                        }
                    }
                });
            }
        } 
    setInterval(() => {
    fetch('/check-session')
        .then(res => res.json())
        .then(data => {
        if (!data.logged_in) {
            alert('เข้าสู่ระบบอีกครั้ง');
            window.location.href = '/login';
        }
        });
    }, 60 * 60 * 500); // ทุก 30 minute


    $(document).ready(function() {
        checkApprovePolicies()
        
    });

    $.get('/still-alive').done(res => {
    })
    function loadNew() {
        $.get('/news-popup').done(res => {
            $('.body-popup').empty()
            if(res.news.length > 0){
                $('#popupNews').modal('show')
                let content = ''
                let ct = ''
                let btn = ''
                res.news.map((item,index) => {
                    if(index == 0){
                        btn += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="active" aria-current="true" aria-label="Slide ${index}"></button>`;
                        ct = ` <div class="carousel-item active">
                            <img class="d-block w-100" src="${item.thumbnail}" alt="Slide ${index}">
                            </div>`
                    }else{
                        btn += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" aria-label="Slide ${index}"></button>`;
                        ct = ` <div class="carousel-item">
                            <img class="d-block w-100" src="${item.thumbnail}" alt="Slide ${index}">
                            </div>`
                    }
                    content = content + ct
                })
                $('.carousel-indicators').append(btn)
                $('.body-popup').append(content)

            }
        })
    }

    function checkApprovePolicies(){
        if (approve_policies == 0) {
            let app_name = $('#app_name').val()
            if(app_name == 'DPlus'){
                $('#policiesModal').modal('show')
            }
        }
        loadNew()
    }
        function updateReadNew(param) {
            $.get('/update-read-news',{'action':param}).done(res => {
                if(res.status){
                    $('#popupNews').modal('hide')
                }
            })
        }
        function getNotification() {
            console.log('gettt');
            $.get('/get-news-noti').done(res => {
                $('.noti-news').empty()
                let content = ''
                let ct = ''
                if(res.news.length > 0){
                    res.news.map((item,index) => {
                        var html = item.detail
                        var div = document.createElement("noti-news");
                        div.innerHTML = html;
                        var text = div.textContent || div.innerText || "";
                        if(item.thumbnail != null){
                            ct = `  <a href="/news-detail/${item.slug}" style="width:250px;" class="border-bottom dropdown-item notify-item language py-2" data-lang="en" title="English">
                                    <div class="d-flex">    
                                        <img src="${item.thumbnail}" alt="user-image" class="me-2  rounded" height="50">
                                        <div class="d-grid">
                                            <div style="font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:170px;">
                                                <span class="align-middle text-bold">${item.title}</span>
                                            </div>
                                            <div style="font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:170px;">
                                                <span class="align-middle" style="font-size:12px;color:#A6ACAF">${text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>`
                        }else{
                            ct = `  <a href="/news-detail/${item.slug}" style="width:250px;" class="border-bottom dropdown-item notify-item language py-2" data-lang="en" title="English">
                                    <div class="d-flex">    
                                        <div class="d-grid">
                                            <div style="font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:170px;">
                                                <span class="align-middle text-bold">${item.title}</span>
                                            </div>
                                            <div style="font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:170px;">
                                                <span class="align-middle" style="font-size:12px;color:#A6ACAF">${text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>`
                        }
               
                        content = content + ct 
                    })
                    content = content + '<div class="text-center"><a href="/news">ดูข่าวสารทั้งหมด</a></div>'

                }else{
                    content = '<div class="text-center"><span>ไม่มีข่าวสารตอนนี้</span></div>'
                }
                $('.noti-news').append(content)
            })
        }
        function openDropdown() {
            getNotification()
            $.get('/update-read-noti',{'action':1}).done(res => {
                if(res.status){
                    $('.badge-noti').empty()
                    $('.badge-noti').append('<i class="ri-notification-line fs-20"></i>')
                }
            })
        }
        $('.close').on('click',function(){
            $('.modal').modal('hide')
        })
        $('#approve_policiesx').on('change',function(){
            if ($(this).is(':checked')) {
                $('#btn-approve-policies').attr('disabled',false)
            }else{
                $('#btn-approve-policies').attr('disabled',true)
            }
        })
        function onReloadPage() {
            location.reload()
        }
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
        function approvePolicies() {
            $.get('/approve-policies',{'action':1}).done(res => {
                if(res.status){
                    $('#policiesModal').modal('hide')
                }
            })
        }

    
