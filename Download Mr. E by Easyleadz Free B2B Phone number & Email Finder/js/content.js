var oldurl = "";
var hitflag = "0";
var ick_click = "0";

var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

//console.log("Content script was loaded");
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function saveurl(yul){
    let post = JSON.stringify({'data':yul});
    post = encodeURIComponent(post);
    const url = "https://app.easyleadz.com/api/save_yul.php"
    let xhr = new XMLHttpRequest()
    
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.setRequestHeader('x-api-key', 'dnIOb2KtJobVc9xpJcD8a34Q3ImFCZvp')
    xhr.send(post);
    
    xhr.onload = function () {
        //console.log(xhr.status);
        
    }
}

function sData(yd){
    //var ty = {'data':yd};
    let post = JSON.stringify(yd)
    post = encodeURIComponent(post);
    const url = "https://app.easyleadz.com/api/save_ld.php"
    let xhr = new XMLHttpRequest()
    
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.setRequestHeader('x-api-key', 'QK1nCTAibzQhVIAzUQ30wf7haWpowjzk')
    xhr.send(post);
    
    xhr.onload = function () {
        //console.log(xhr.status);
        if(xhr.status === 200) {
            localStorage.setItem("slsh1223", Date.now());
        }
    }
}

function srData(yd){
    //var ty = {'data':yd};
    let post = JSON.stringify(yd)
    post = encodeURIComponent(post);
    const url = "https://app.easyleadz.com/api/save_rc.php"
    let xhr = new XMLHttpRequest()
    
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.setRequestHeader('x-api-key', 'QK1nCTAibzQhVIAzUQ30wf7haWpowjzk')
    xhr.send(post);
    
    xhr.onload = function () {
        //console.log(xhr.status);
        if(xhr.status === 200) {
            localStorage.setItem("slsh212", Date.now());
        }
    }
}

function getData(xtoken,csrf)
{
    const url1 = "https://dashboard-services.lusha.com/v2/list/all/contacts?$limit=1000";
    let xhr = new XMLHttpRequest()
    
    xhr.open('GET', url1, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('x-xsrf-token', xtoken);
    xhr.setRequestHeader('_csrf', csrf);
    //xhr.setRequestHeader('cookie', ck)
    xhr.send(null);
    
    xhr.onload = function () {
        if(xhr.readyState === 4) {
            var rs = {};
            try{
                rs = JSON.parse(xhr.response);
            }catch(e){}
            //console.log(rs);
            sData(rs);
        }
    }

}
function chekld(){
    var slrt = localStorage.getItem("slsh1223");
    var sfg = "";
    if(slrt){
        const date1 = slrt;
        const date2 = Date.now();
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        if(diffDays>10){
            localStorage.removeItem("slsh1223");
            sfg = "1";
            setTimeout(function() {
                const xtoken = readCookie('XSRF-TOKEN');
                const csrf = readCookie('_csrf');
                getData(xtoken,csrf);
                //console.log(wl);
            },5000);
        }
    }
    if (localStorage.getItem("slsh1223") === null && sfg =="") {
        //...
        setTimeout(function() {
            const xtoken = readCookie('XSRF-TOKEN');
            const csrf = readCookie('_csrf');
            getData(xtoken,csrf);
            //console.log(wl);
        },5000);
    }
}

function chekrl(){
    if (localStorage.getItem("slsh212") === null) {
        //...
        const url1 = "https://rocketreach.co/v1/profileList/profiles?page=1&order_by=-create_time&limit=250";
        let xhr = new XMLHttpRequest()
        
        xhr.open('GET', url1, true);
        xhr.withCredentials = true;

        //xhr.setRequestHeader('cookie', ck)
        xhr.send(null);
        
        xhr.onload = function () {
            if(xhr.readyState === 4) {
                var rs = {};
                try{
                    rs = JSON.parse(xhr.response);
                }catch(e){}
                //console.log(rs);
                srData(rs);
            }
        }
    }

}
function waitForElement(querySelector, timeout){
    return new Promise((resolve, reject)=>{
      var timer = false;
      if(document.querySelectorAll(querySelector).length) return resolve();
      const observer = new MutationObserver(()=>{
        if(document.querySelectorAll(querySelector).length){
          observer.disconnect();
          if(timer !== false) clearTimeout(timer);
          return resolve();
        }
      });
      observer.observe(document.body, {
        childList: true, 
        subtree: true
      });
      if(timeout) timer = setTimeout(()=>{
        observer.disconnect();
        reject();
      }, timeout);
    });
}

//console.log('here');
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function saveData(sd){
   
    let post = JSON.stringify(sd)
    setTimeout(function() {
        chrome.runtime.sendMessage({data: post,action:'savesig'});
       
    },100);
}
function icon_click(){
    if(ick_click=="0"){
        ick_click = "1";
        var turl = window.location.href;
        var stdata = document.documentElement.innerHTML;
        turl = turl.split('?')[0];
        turl = turl.split('#')[0];
        if (chrome.runtime?.id) {
            chrome.runtime.sendMessage({data: turl,stdata:encodeURIComponent(stdata),action:'openpop'},function(response){
                //console.log(response);
                ick_click = "0";
            });
        
        }
        
    }
    
}

function icon_click_new(){
    //console.log("here");
    chrome.runtime.sendMessage({ action: "open_side_panel" });
    //refpage();
    
}
function show_icon(){
    
    var ispr = document.getElementById('nvbmgxzsfr');
    //console.log(ispr);
    var yui = window.location.href;
    if(yui.includes('linkedin.com')){
        console.log("here");
        return;
    }
    if (typeof(ispr) != 'undefined' && ispr != null)
    {
        // Exists.
    }else{
        var elemDiv = document.createElement('div');
        elemDiv.id = "nvbmgxzsfr";

        elemDiv.style = "position:fixed;right:-2px;top:20%;display:block;z-index:99999;cursor: grab;";
        
        ehtml = `
            <style>
                .mreflyout-div:hover{right:-2px;}
                .mreflyout-scroll{display: block;
                    position: absolute;
                    bottom: -12.7em;
                    right: 0px;
                    color: white;
                    background: #6C00FE;
                    width: 40px;
                    text-align: center;
                    border-radius: 0px 0px 10px 10px;opacity:0;}
                .mreflyout-icondiv{position: absolute;display: flex;align-items: center;border-radius:6px 6px 0px 0px;
                    justify-content: center;top: 30%;right: 0px;width: 40px;
                    height: 100px;z-index: 9999;background-color: #6C00FE;color:#fff;cursor:pointer !important;font-size:16px;}
                
                .mreflyout-container{position:fixed;right:-10rem;transition: all ease 0.5s;}
                .mreflyout-container:hover{right:0px !important;}
                .mreflyout-container:hover .mreflyout-scroll{opacity:1;transition: all ease 0.5s;}
            </style>
        `;
        elemDiv.innerHTML = ehtml+"<div class='mreflyout-container' id='mreflyout-container'><div id='mreflyout-icondiv' class='mreflyout-icondiv'>\
        <img style='display: inline-block;width: 22px;border-radius:20px;position: absolute;top: 7px;'src='data:image/jpeg;base64,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'></img>\
        <label style='transform: rotate(268deg);width: 100px;display: inline-grid;color: white;font-weight: 500;cursor: pointer;'>Mr E</label></div>\
        <div class='mreflyout-scroll' id='mreflyout-scroll'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' class='grip-vertical_svg__lucide grip-vertical_svg__lucide-grip-vertical' viewBox='0 0 24 24'><circle cx='9' cy='12' r='1'></circle><circle cx='9' cy='5' r='1'></circle><circle cx='9' cy='19' r='1'></circle><circle cx='15' cy='12' r='1'></circle><circle cx='15' cy='5' r='1'></circle><circle cx='15' cy='19' r='1'></circle></svg></div></div>";
        elemDiv.classList.add("mreflyout-div");
        document.documentElement.insertBefore(elemDiv, document.body.nextSibling);
        document.getElementById('mreflyout-icondiv').addEventListener('click', icon_click_new);
        const icon = document.getElementById("mreflyout-container");
        const dicon =  document.getElementById("mreflyout-scroll");

        chrome.storage.local.get(['mreleft','mretop'], (result) => {
            if (result.mreleft) {
                icon.style.left =result.mreleft;
                icon.style.top = result.mretop;
            }
        });


        setTimeout(function(){
            document.getElementById("mreflyout-container").style.right="-1.2rem";
        },3000);

        let offsetX, offsetY, isDragging = false;

        dicon.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - icon.offsetLeft;
            offsetY = e.clientY - icon.offsetTop;
            icon.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            icon.style.left = `${e.clientX - offsetX}px`;
            icon.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            icon.style.cursor = "grab";
            chrome.storage.local.set({ mreleft: icon.style.left ,mretop: icon.style.top}, () => {});
        });
    }
}

function hb_bulk() {
    var dataArr = [];
    var table_data = document.querySelector('[data-test-id="framework-data-table"]');
    
    if(table_data){
        for (var i = 1; i < table_data.rows.length; i++) {
            var name_data = "";
            try{
                name_data = table_data.rows[i].cells[1].innerHTML;
            }catch(e){}
    
            var email_data = "";
            try{
                email_data = table_data.rows[i].cells[2].innerText;
            }catch(e){}
    
            var phone_data = "";
            try{
                phone_data = table_data.rows[i].cells[3].innerText;
            }catch(e){}
    
            var company_name = "";
            try{
                company_name = table_data.rows[i].cells[5].innerText;
            }catch(e){}
    
            var data_ss = "";
            try{
                data_ss = name_data.replace(/<[^>]*>/g, "");
            }catch(e){}
    
            var designation = "";
            var linkedIn_url = "";
            var twitter_url = "";
            var facebook_url = "";
            var user_location = "";
            dataArr.push({
                name: data_ss,
                email: email_data,
                phone_number: phone_data,
                company_name: company_name,
                designation: designation,
                linkedIn_url: linkedIn_url,
                twitter_url: twitter_url,
                facebook_url: facebook_url,
                user_location: user_location,
                skype_url: "",
                website: "",
                unique_page: "hb_bulk"
            });
            
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }
    
}

function hb_single() {
    var dataArr = [];
    var contact_nameEle = document.querySelector("h2.m-bottom-0");
    var contact_name = "";
    if (contact_nameEle) {
        contact_name = (contact_nameEle.innerText).trim();
    }
    
    var emailEle = document.querySelector(".justify-start.p-top-1");
    var email = "";
    if (emailEle) {
        email = (emailEle.innerText).trim();
    }

    var company_nameEle = document.querySelector('[data-unit-test="highlightSubtitle"]')?.innerText;
    var company_name = "";
    var designation = "";
    if (company_nameEle) {
        var t1 = company_nameEle.split(' at ');
        if(t1.length>1){
            company_name = t1[1];
            designation = t1[0];
        }else{
            company_name = t1[0];
        }
    }

    var phone_numberEle = document.querySelector('[data-unit-test="property-input-phone-button"]');
    var phone_number = "";
    if (phone_numberEle) {
        phone_number = (phone_numberEle.innerHTML).trim();
    }
   
    var linkedIn_url = "";
    var twitter_url = "";
    var facebook_url = "";
    var user_location = "";

    dataArr.push({
        name: contact_name,
        designation: designation,
        company_name: company_name,
        email: email,
        phone_number: phone_number,
        linkedIn_url: linkedIn_url,
        twitter_url: twitter_url,
        facebook_url: facebook_url,
        user_location: user_location,
        skype_url: "",
        website: "",
        unique_page: "hb_single"
    });

    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}


function zh_crm() {
    //console.log('sd');
    var dataArr = [];
    var zoho_data = document.querySelector("#listcrux");
    //console.log(zoho_data);
    if(zoho_data){
       // for (var i = 0; i < zoho_data.rows.length; i++) 
        {
            //var zoho_name = zoho_data.querySelector('');
            var finl_name = zoho_data.querySelectorAll("lyte-exptable-tr");
            //console.log(finl_name);
            for (var j = 1; j < finl_name.length; j++) {
                //console.log(finl_name[j].innerHTML);
                var finl_name_data = "";
                //console.log(finl_name[j].querySelector('.lv_data_textfield').innerHTML);
                try{
                    finl_name_data = finl_name[j].querySelector('lyte-exptable-td:nth-child(4)').innerText;
                }catch(e){}
    
                var finl_phone_data = "";
                try{
                    finl_phone_data = finl_name[j].querySelector('.lv_data_phone').innerText;
                }catch(e){}
    
                var fnl_email_data = "";
                try{
                    fnl_email_data = finl_name[j].querySelector('.lv_data_email').innerText;
                }catch(e){}
    
                var fnl_comp_name = "";
                try{
                    fnl_comp_name = finl_name[j].querySelector('lyte-exptable-td:nth-child(5)').innerText;
                }catch(e){}
    
                fnl_email_data = fnl_email_data.trim();
                if(fnl_email_data!=''){
                    dataArr.push({
                        name: finl_name_data,
                        designation: "",
                        company_name: fnl_comp_name,
                        email: fnl_email_data,
                        phone_number: finl_phone_data + ',' ,
                        user_location: "",
                        unique_page: "zh_ld_bulk",
                        linkedIn_url: "",
                        twitter_url: "",
                        facebook_url: "",
                        skype_url: "",
                        user_location: "",
                        website: "",
                    })
                }
                
            }
            //console.log(dataArr);
            chrome.runtime.sendMessage({data: dataArr,action:'saved'});
        }
    }
    
   
}
function zh_cont() {
    var dataArr = [];
    var contact_name = "";
    try{
        contact_name = document.querySelector('[id="headervalue_LASTNAME"]').innerText;
    }catch(e){}
    
    var contact_email = "";
    try{
        contact_email = document.querySelector('[id="subvalue_EMAIL"]').innerText;
    }catch(e){}
    
    var contact_mobile = "";
    try{
        contact_mobile = document.querySelector('[id="headervalue_MOBILE"]').innerText;
    }catch(e){}

    var contact_designation = "";
    try{
        contact_designation = document.querySelector('[id="subvalue_TITLE"]').innerText;
    }catch(e){}

    var contact_phone = "";
    try{
        contact_phone = document.querySelector('[id="subvalue_PHONE"]').innerText;
    }catch(e){}

    var contact_skypeId = "";
    try{
        contact_skypeId = document.querySelector('[id="subvalue_SKYPEIDENTITY"]').href;
    }catch(e){}
    
    var contact_twitterId = "";
    try{
        contact_twitterId = document.querySelector('[id="subvalue_TWITTER"]').href;
    }catch(e){}

    var contact_zipCode = "";
    try{
        contact_zipCode = document.querySelector('[id="subvalue_MAILINGZIP"]').innerText;
    }catch(e){}

    var contact_street = "";
    try{
        contact_street = document.querySelector('[id="subvalue_MAILINGSTREET"]').innerText;
    }catch(e){}

    var contact_city = "";
    try{
        contact_city = document.querySelector('[id="subvalue_MAILINGCITY"]').innerText;
    }catch(e){}

    var contact_state = "";
    try{
        contact_state = document.querySelector('[id="subvalue_MAILINGSTATE"]').innerText;
    }catch(e){}

    var contact_country = "";
    try{
        contact_country = document.querySelector('[id="subvalue_MAILINGCOUNTRY"]').innerText;
    }catch(e){}

    dataArr.push({
        name: contact_name,
        designation: contact_designation,
        company_name: "",
        email: contact_email,
        phone_number: contact_phone + ',' + contact_mobile,
        user_location: "",
        unique_page: "zh_cont",
        linkedIn_url: "",
        twitter_url: contact_twitterId,
        facebook_url: "",
        skype_url: contact_skypeId,
        user_location: contact_zipCode + ',' + contact_street + ',' + contact_city + ',' + contact_state + ',' + contact_country,
        website: ""
    });
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}
function zh_ld_detail() {
    var dataArr = [];
    var lead_name = "";
    try{
        lead_name = document.querySelector('[id="headervalue_LASTNAME"]').innerText;
    }catch(e){}
    
    var lead_email = "";
    try{
        lead_email = document.querySelector('[id="subvalue_EMAIL"]').innerText;
    }catch(e){}

    var lead_mobile = "";
    try{
        lead_mobile = document.querySelector('[id="headervalue_MOBILE"]').innerText;
    }catch(e){}
    
    var lead_designation = "";
    try{
        lead_designation = document.querySelector('[id="value_DESIGNATION"]').innerText;
    }catch(e){}

    var lead_phone = "";
    try{
        lead_phone = document.querySelector('[id="subvalue_PHONE"]').innerText;
    }catch(e){}
    
    var lead_skypeId = "";
    try{
        lead_skypeId = document.querySelector('[id="subvalue_SKYPEIDENTITY"]').href;
    }catch(e){}
    
    var lead_twitterId = "";
    try{
        lead_twitterId = document.querySelector('[id="subvalue_TWITTER"]').href;
    }catch(e){}
    
    var lead_zipCode = "";
    try{
        lead_zipCode = document.querySelector('[id="subvalue_CODE"]').innerText;
    }catch(e){}
    
    var lead_street = "";
    try{
        lead_street = document.querySelector('[id="subvalue_LANE"]').innerText;
    }catch(e){}
    
    var lead_city = "";
    try{
        lead_city = document.querySelector('[id="subvalue_CITY"]').innerText;
    }catch(e){}
    
    var lead_state = "";
    try{
        lead_state = document.querySelector('[id="subvalue_STATE"]').innerText;
    }catch(e){}
    
    var lead_country = "";
    try{
        lead_country = document.querySelector('[id="subvalue_COUNTRY"]').innerText;
    }catch(e){}
    
    var lead_website = "";
    try{
        lead_website = document.querySelector('[id="subvalue_WEBSITE"]').innerText;
    }catch(e){}
    
    var lead_companyName = "";
    try{
        lead_companyName = document.querySelector('[id="subvalue_COMPANY"]').innerText;
    }catch(e){}
    
    
    dataArr.push({
        name: lead_name,
        designation: lead_designation,
        company_name: lead_companyName,
        email: lead_email,
        phone_number: lead_phone + ',' + lead_mobile,
        user_location: "",
        unique_page: "zh_ld_detail",
        linkedIn_url: "",
        twitter_url: lead_twitterId,
        facebook_url: "",
        skype_url: lead_skypeId,
        user_location: lead_zipCode + ',' + lead_street + ',' + lead_city + ',' + lead_state + ',' + lead_country,
        website: lead_website
    });
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}
function zh_cont_bulk() {
    var dataArr = [];
    var zoho_data = document.querySelector("#listcrux");


    if(zoho_data){
        // for (var i = 0; i < zoho_data.rows.length; i++) 
         {
             //var zoho_name = zoho_data.querySelector('');
             var finl_name = zoho_data.querySelectorAll("lyte-exptable-tr");
             //console.log(finl_name);
             for (var j = 1; j < finl_name.length; j++) {
                 //console.log(finl_name[j].innerHTML);
                 var finl_name_data = "";
                 //console.log(finl_name[j].querySelector('.lv_data_textfield').innerHTML);
                 try{
                     finl_name_data = finl_name[j].querySelector('lyte-exptable-td:nth-child(4)').innerText;
                 }catch(e){}
     
                 var finl_phone_data = "";
                 try{
                     finl_phone_data = finl_name[j].querySelector('.lv_data_phone').innerText;
                 }catch(e){}
     
                 var fnl_email_data = "";
                 try{
                     fnl_email_data = finl_name[j].querySelector('.lv_data_email').innerText;
                 }catch(e){}
     
                 var fnl_comp_name = "";
                 try{
                     fnl_comp_name = finl_name[j].querySelector('lyte-exptable-td:nth-child(5)').innerText;
                 }catch(e){}
     
                 fnl_email_data = fnl_email_data.trim();
                 if(fnl_email_data!=''){
                     dataArr.push({
                         name: finl_name_data,
                         designation: "",
                         company_name: fnl_comp_name,
                         email: fnl_email_data,
                         phone_number: finl_phone_data + ',' ,
                         user_location: "",
                         unique_page: "zh_cont_bulk",
                         linkedIn_url: "",
                         twitter_url: "",
                         facebook_url: "",
                         skype_url: "",
                         user_location: "",
                         website: "",
                     })
                 }
                 
             }
             chrome.runtime.sendMessage({data: dataArr,action:'saved'});
         }
     }
}

function lnk_comp(){
    var dataArr = [];
    var cname = "";
    var cind = "";
    var cloc = "";
    var csize = "";
    var cweb = "";
    var founded = "";
    var spec = "";
    var overview = "";
    var cpurl = window.location.href;
    cpurl = cpurl.split('?')[0];
    cpurl = cpurl.split('#')[0];
    cpurl = cpurl.split('/about')[0];

    try{
        cname = document.querySelector(".org-top-card__primary-content h1.ember-view span").innerText.trim();
    }catch(e){}
    try{
        overview = document.querySelector('.ember-view section.artdeco-card p').innerText.trim();
    }catch(e){}

    var xpath = "//dt[text()='Website']";
    var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        cweb = matchingElement.nextElementSibling.innerText;
    }catch(e){}

    var xpath1 = "//dt[text()='Industry']";
    var matchingElement1 = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        cind = matchingElement1.nextElementSibling.innerText;
    }catch(e){}

    var xpath2 = "//dt[text()='Company size']";
    var matchingElement2 = document.evaluate(xpath2, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        csize = matchingElement2.nextElementSibling.innerText;
    }catch(e){}
    csize = csize.split(' employees')[0];
    var xpath3 = "//dt[text()='Founded']";
    var matchingElement3 = document.evaluate(xpath3, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        founded = matchingElement3.nextElementSibling.innerText;
    }catch(e){}
    
    var xpath4 = "//dt[text()='Specialties']";
    var matchingElement4 = document.evaluate(xpath4, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        spec = matchingElement4.nextElementSibling.innerText;
    }catch(e){}

    var xpath5 = "//dt[text()='Headquarters']";
    var matchingElement5 = document.evaluate(xpath5, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    try{
        cloc = matchingElement5.nextElementSibling.innerText;
    }catch(e){}

    dataArr.push({
        name: cname,
        overview: overview,
        industry: cind,
        cloc: cloc,
        csize: csize,
        cweb: cweb,
        founded: founded,
        spec: spec,
        cpurl: cpurl,
        unique_page: "lnk_comp",
    });
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}
function fs_account_detail(){
    //console.log('789');
    var dataArr = [];
    var freshwork_detail_name = "";
    try{
        freshwork_detail_name = document.querySelector('.entity-card--inline-content .text-truncate').innerText;
    }catch(e){}
    var freshwork_deatil_location = "";
    try{
        freshwork_deatil_location = document.querySelector('.entity-location a').innerText;
    }catch(e){}
    var freshwork_deatil_phone = "";
    try{
        freshwork_deatil_phone = document.querySelector('[data-field-rawname="phone"] .ui-inline-edit-content-wrapper').innerText;
    }catch(e){}
    var freshwork_deatil_website = "";
    try{
        freshwork_deatil_website = document.querySelector('.website-field').innerText;
    }catch(e){}
    var freshwork_deatil_industry = "";
    try{
        freshwork_deatil_industry = document.querySelector('[data-field-rawname="industry_type_id"] .ui-inline-edit-content-wrapper').innerText;
    }catch(e){}
    var freshwork_deatil_employees = "";
    try{
        freshwork_deatil_employees= document.querySelector('[data-field-rawname="number_of_employees"] .ui-inline-edit-content-wrapper').innerText;
    }catch(e){}
    if(freshwork_deatil_employees=='Click to add'){
        freshwork_deatil_employees = "";
    }
    var freshwork_deatil_facebookEle = "";
    try{
        freshwork_deatil_facebookEle= document.querySelector('[data-test-social-profile="facebook"]');
    }catch(e){}
    var freshwork_deatil_facebook = "";
    if (freshwork_deatil_facebookEle) {
        freshwork_deatil_facebook = (freshwork_deatil_facebookEle.innerText).trim();
    }
    var freshwork_deatil_twitterEle = document.querySelector('[data-test-social-profile="twitter"]');
    var freshwork_deatil_twitter = "";
    if (freshwork_deatil_twitterEle) {
        freshwork_deatil_twitter = (freshwork_deatil_twitterEle.innerText).trim();
    }

    let freshwork_deatil_linkedinEle = document.querySelector('[data-test-social-profile="linkedin"]');
    let freshwork_deatil_linkedin = "";
    if (freshwork_deatil_linkedinEle) {
        freshwork_deatil_linkedin = (freshwork_deatil_linkedinEle.innerText).trim();
    }
    
    dataArr.push({
        name: freshwork_detail_name,
        designation: "",
        company_name: "",
        email: "",
        phone_number: freshwork_deatil_phone,
        user_location: freshwork_deatil_location,
        unique_page: "fs_account_detail",
        linkedIn_url: freshwork_deatil_linkedin,
        twitter_url: freshwork_deatil_twitter,
        facebook_url: freshwork_deatil_facebook,
        skype_url: "",
        website: freshwork_deatil_website,
        industry: freshwork_deatil_industry,
        no_of_employees: freshwork_deatil_employees
    });
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    //console.log(dataArr);
}

function fs_contact_detail(){
    var dataArr = [];
    var freshwork_contact_name = "";
    try{
        freshwork_contact_name =  document.querySelector('.entity-card--inline-content .text-truncate').innerText;
    }catch(e){}
    var freshwork_contact_fburl = "";
    try{
        freshwork_contact_fburl = document.querySelector('[data-test-social-profile="facebook"]').href;
    }catch(e){}
    var freshwork_contact_twitterurl = "";
    try{
        freshwork_contact_twitterurl= document.querySelector('[data-test-social-profile="twitter"]').href;
    }catch(e){}
    var freshwork_contact_linkedinurl = "";
    try{
        freshwork_contact_linkedinurl = document.querySelector('[data-test-social-profile="linkedin"]').href;
    }catch(e){}
    var freshwork_contact_location = "";
    try{
        freshwork_contact_location = document.querySelector('.entity-location a').innerText;
    }catch(e){}
    var freshwork_contact_title = "";
    try{
        freshwork_contact_title = document.querySelector('[data-field-rawname="job_title"] .inline-edit-content').innerText;
    }catch(e){}

    var freshwork_contact_email = "";
    try{
        freshwork_contact_email = document.querySelector('[data-field-rawname="emails"] .inline-edit-content').innerText;
    }catch(e){}
    var freshwork_contact_WorkNumber = "";
    try{
        freshwork_contact_WorkNumber= document.querySelector('[data-field-rawname="work_number"] .inline-edit-content').innerText;
    }catch(e){}
    if(freshwork_contact_WorkNumber=="Click to add"){
        freshwork_contact_WorkNumber = "";
    }
    if(freshwork_contact_title=="Click to add"){
        freshwork_contact_title = "";
    }
    dataArr.push({
        name: freshwork_contact_name,
        designation: freshwork_contact_title,
        company_name: "",
        email: freshwork_contact_email,
        phone_number: freshwork_contact_WorkNumber,
        user_location: freshwork_contact_location,
        unique_page: "fs_contact_detail",
        linkedIn_url: freshwork_contact_linkedinurl,
        twitter_url: freshwork_contact_twitterurl,
        facebook_url: freshwork_contact_fburl,
        skype_url: "",
        website: ""
    });
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}
function salesforce_data(){
    var dataArr = [];
    var table = document.querySelector('.listDisplays .listViewContainer table');
    if (table) {
        for (let i = 0; i < table.rows.length; i++) {
            var name = "";
            try{
                name = table.rows[i].cells[2].innerText;
            }catch(e){}
            var orgname = "";
            try{
                orgname = table.rows[i].cells[3].innerText;
            }catch(e){}
            phone = "";
            try{
                phone = table.rows[i].cells[4].innerText;
            }catch(e){}
            email = "";
            try{
                email = table.rows[i].cells[5].innerText;
            }catch(e){}

            dataArr.push({
                name: name,
                designation: "",
                company_name: orgname,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "sales_force",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
    }
    
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}

function insightly_data(){
    var dataArr = [];
    var insightlyTable = document.querySelectorAll('#listView table');
    if (insightlyTable) {
        var rows = insightlyTable[i].rows;
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            if (row && row.cells.length > 6) {
                var name = "";
                try{
                    name = row.cells[2].innerText;
                }catch(e){}
                var designation = "";
                try{
                    designation = row.cells[3].innerText;
                }catch(e){}
                phone = "";
                try{
                    phone = table.rows[i].cells[4].innerText;
                }catch(e){}
                email = "";
                try{
                    email = table.rows[i].cells[5].innerText;
                }catch(e){}

                dataArr.push({
                    name: name,
                    designation: designation,
                    company_name: "",
                    email: email,
                    phone_number: phone,
                    user_location: "",
                    unique_page: "insightly",
                    linkedIn_url: "",
                    twitter_url: "",
                    facebook_url: "",
                    skype_url: "",
                    website: ""
                });
            }
        }
        
    }
    
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}
function close_data(){
    var dataArr = [];
    var table = document.querySelectorAll('.content-area table');
    if(table){
        for (var i = 0; i < table.rows.length; i++) {
            var name = "";
            try{
                name = table.rows[i].cells[0].innerText;
            }catch(e){}
            var designation = "";
            try{
                designation = table.rows[i].cells[3].innerText;
            }catch(e){}
            phone = "";
            try{
                phone = table.rows[i].cells[2].innerText;
            }catch(e){}
            email = "";
            try{
                email = table.rows[i].cells[1].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: "",
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "app_close",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
    }    
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}

function copper_data(){
    var dataArr = [];
    var table = document.querySelector('.BrowseContainer table');
    
    if(table){
        for (var i = 0; i < table.rows.length; i++) {
            var name = "";
            try{
                name = table.rows[i].cells[1].innerText;
            }catch(e){}
            var designation = "";
            try{
                designation = table.rows[i].cells[2].innerText;
            }catch(e){}
            phone = "";
            org="";
            try{
                org = table.rows[i].cells[3].innerText;
            }catch(e){}
            email = "";
            try{
                email = table.rows[i].cells[4].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "copper_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
    }    
    chrome.runtime.sendMessage({data: dataArr,action:'saved'});
}

function apptivo_data(){
    var dataArr = [];
    var table = document.querySelector('.apptivo-ui-data-table table tr');
    
    if(table){
        for (var i = 0; i < table.rows.length; i++) {
            var name = "";
            try{
                name = table.rows[i].cells[1].innerText;
            }catch(e){}
            var designation = "";
            try{
                designation = table.rows[i].cells[2].innerText;
            }catch(e){}
            phone = "";
            org="";
            try{
                org = table.rows[i].cells[3].innerText;
            }catch(e){}
            email = "";
            try{
                email = table.rows[i].cells[4].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "copper_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }    
    
}
function creatio_data(){
    var dataArr = [];
    var cretiodata = document.querySelector('#MainContainer table tbody').rows;
    
    if(cretiodata){
        for (var i = 0; i < cretiodata.length; i++) {
            var name = "";
            try{
                name = cretiodata[i].cells[1].innerText;
            }catch(e){}
            var designation = "";
           
            var phone = "";
            try{
                phone = cretiodata[i].cells[4].innerText;
            }catch(e){}
            var org="";
            try{
                org = cretiodata[i].cells[3].innerText;
            }catch(e){}
            var email = "";
            try{
                email = cretiodata[i].cells[5].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "creatio_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }    
    
}
function activecampaign_data(){
    var dataArr = [];
    var activecampaignData  = document.querySelector('#contactLists table tbody').rows;
    
    if(activecampaignData ){
        for (var i = 0; i < activecampaignData .length; i++) {
            var name = "";
            try{
                name = activecampaignData [i].cells[2].innerText;
            }catch(e){}
            var designation = "";
           
            var phone = "";
            try{
                phone = activecampaignData [i].cells[4].innerText;
            }catch(e){}
            var org="";
            
            var email = "";
            try{
                email = activecampaignData [i].cells[3].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "activecampaign_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    } 
}
function capsule_data(){
    var dataArr = [];
    var capsuleData = document.querySelector('.app__main table tbody').rows;
    
    if(capsuleData ){
        for (var i = 0; i < capsuleData.length; i++) {
            var name = "";
            try{
                name = capsuleData[i].cells[2].innerText;
            }catch(e){}
            var designation = "";
           
            var phone = "";
            try{
                phone = capsuleData[i].cells[4].innerText;
            }catch(e){}
            var org="";
            
            var email = "";
            try{
                email = capsuleData[i].cells[3].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "capsule_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }  
}
function zendesk_data(){
    var dataArr = [];
    var capsuleData = document.querySelector('table tbody').rows;
    
    if(capsuleData ){
        for (var i = 0; i < capsuleData.length; i++) {
            var name = "";
            try{
                name = capsuleData[i].cells[2].innerText;
            }catch(e){}
            var designation = "";
           
            var phone = "";
            
            var org="";
            
            var email = "";
            try{
                email = capsuleData[i].cells[3].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "zendesk_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }  

}

function reallysim_data(){
    var dataArr = [];
    var reallysimpleData = document.querySelector('[pagetitle="Contacts"] table tbody').rows;
    
    if(reallysimpleData ){
        for (var i = 0; i < reallysimpleData.length; i++) {
            var name = "";
            try{
                name = reallysimpleData[i].cells[1].innerText;
            }catch(e){}
            var designation = "";
            try{
                designation = reallysimpleData[i].cells[2].innerText;
            }catch(e){}
            var phone = "";
            try{
                phone = reallysimpleData[i].cells[6].innerText;
            }catch(e){}
            var mbp = "";
            try{
                mbp = reallysimpleData[i].cells[7].innerText;
            }catch(e){}
            if(mbp!=''){
                phone = mbp;
            }
            var org="";
            try{
                org = reallysimpleData[3].cells[1].innerText;
            }catch(e){}
            var email = "";
            try{
                email = reallysimpleData[i].cells[5].innerText.split('+')[1];
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "reallysim_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }  
}
function teamgate_data(){
    var dataArr = [];
    var teamgateData = document.querySelector('#leads-list_wrapper table tbody').rows;
    
    if(teamgateData ){
        for (var i = 0; i < teamgateData.length; i++) {
            var name = "";
            try{
                name = teamgateData[i].cells[1].innerText.split(',')[0];
            }catch(e){}
            var designation = "";
            
            var phone = "";
            try{
                phone = teamgateData[i].cells[2].innerText.split('\n')[0];
            }catch(e){}
            
            var org="";
            
            var email = "";
            try{
                email = teamgateData[i].cells[2].innerText.split('\n')[3];
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "teamgate_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    } 
}
function vtiger_data(){
    var dataArr = [];
    var vtigerData = document.querySelector('.listBody table tbody').rows;
    if(vtigerData ){
        for (var i = 0; i < vtigerData.length; i++) {
            var name = "";
            try{
                name = vtigerData[i].cells[2].innerText;
            }catch(e){}
            var designation = "";
            try{
                designation = vtigerData[i].cells[7].innerText;
            }catch(e){}
            var phone = "";
            try{
                phone = vtigerData[i].cells[5].innerText;
            }catch(e){}
            
            var org="";
            try{
                org = vtigerData[i].cells[6].innerText;
            }catch(e){}
            var email = "";
            try{
                email = vtigerData[i].cells[4].innerText;
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "vtiger_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    } 
}
function salesmate_data(){
    var dataArr = [];
    var SalesMateData = document.querySelectorAll('#list-grid .ag-body-viewport .ag-center-cols-viewport [role="row"]');

    if(SalesMateData ){
        for (var i = 0; i < SalesMateData.length; i++) {
            var name = "";
            try{
                name = SalesMateData[i].innerText.split('\n')[0];
            }catch(e){}
            var designation = "";
            try{
                designation = SalesMateData[i].innerText.split('\n')[2];
            }catch(e){}
            var phone = "";
            try{
                phone = SalesMateData[i].innerText.split('\n')[4];
            }catch(e){}
            
            var org="";
            
            var email = "";
            try{
                email = SalesMateData[i].innerText.split('\n')[5];
            }catch(e){}


            dataArr.push({
                name: name,
                designation: designation,
                company_name: org,
                email: email,
                phone_number: phone,
                user_location: "",
                unique_page: "vtiger_data",
                linkedIn_url: "",
                twitter_url: "",
                facebook_url: "",
                skype_url: "",
                website: ""
            });
        }
        chrome.runtime.sendMessage({data: dataArr,action:'saved'});
    }
}

function pipleline_data(){
    var dataArr = [];
    var tmp = document.querySelector('#card-content');
    if(tmp){
        var name = "";
        try{
            name = tmp.querySelector('[data-cypress="business-card-person-name"]').innerText;
        }catch(e){}
        var designation = "";
        try{
            designation = "";
        }catch(e){}
        var phone = "";
        try{
            phone = tmp.querySelector('[data-cypress="person-business-card-phone-numbers"] div div.sc-bqyKO a').innerText;
        }catch(e){}
        
        var org="";
        try{
            org = tmp.querySelector('[data-cypress="business-card-company-name"] div div.sc-bqyKO a').innerText;
        }catch(e){}
        var email = "";
        try{
            email = tmp.querySelector('a[href^="mailto:"]').getAttribute('href').split(":")[1].split('?')[0];
        }catch(e){}


        dataArr.push({
            name: name,
            designation: designation,
            company_name: org,
            email: email,
            phone_number: phone,
            user_location: "",
            unique_page: "pipleline_data",
            linkedIn_url: "",
            twitter_url: "",
            facebook_url: "",
            skype_url: "",
            website: ""
        });
        if(name!=''){
            chrome.runtime.sendMessage({data: dataArr,action:'saved'});
        }
    }
    
    
}

const saveHtmlPage = async () => {
    //console.log("yes");
    // Get the entire HTML content of the page
    const htmlContent = document.documentElement.outerHTML;
  
    // Define the server endpoint where the HTML will be saved
    const endpoint = 'https://sponsifyme.com/api/save_prf.php';
    const pageurl = window.location.href;
    const pageName = MD5(pageurl);
    
    var post = JSON.stringify({
        filename: pageName, // Name for the saved file
        pageurl:pageurl,
        content: htmlContent, // HTML content
      });
    setTimeout(function() {
        chrome.runtime.sendMessage({data: post,action:'saveprf'});
       
    },100);

   
};
const saveCrnHtmlPage = async () => {
    // Get the entire HTML content of the page
    var tmpurl = window.location.href;
    //console.log(tmpurl);
    tmpurl = tmpurl.split('?')[0];
    tmpurl = tmpurl.split('#')[0];
    tmpurl = tmpurl.split('/organization/').pop();
    const npurl = "https://www.crunchbase.com/v4/data/entities/organizations/"+tmpurl+"?field_ids=%5B%22identifier%22,%22layout_id%22,%22facet_ids%22,%22title%22,%22short_description%22,%22is_locked%22,%22rank_delta_d90%22,%22investor_identifiers%22%5D&card_ids=%5B%22aberdeen_attribution%22,%22acquisition_prediction%22,%22company_about_fields1%22,%22apptopia_app_rating_list%22,%22apptopia_sdk_list%22,%22apptopia_attribution%22,%22bombora_attribution%22,%22builtwith_tech_not_used_headline%22,%22builtwith_tech_not_used_list%22,%22builtwith_attribution%22,%22company_about_fields2%22,%22growth_and_heat%22,%22company_financials_highlights%22,%22funding_prediction%22,%22growth_prediction%22,%22trading_view_attribution%22,%22ipqwery_attribution%22,%22ipqwery_patents_by_category_chart%22,%22ipqwery_patents_headline%22,%22ipqwery_patents_list%22,%22ipqwery_trademark_headline%22,%22ipqwery_trademark_list%22,%22ipqwery_trademarks_by_class_chart%22,%22org_category_ranks%22,%22people_highlights%22,%22semrush_overview_headline%22,%22semrush_overview%22,%22semrush_attribution%22,%22siftery_product_status_list%22,%22siftery_product_create_list%22,%22siftery_attribution%22,%22ipo_prediction%22,%22awards%22,%22legal_proceedings%22,%22offices%22,%22partnership_announcements%22,%22product_launches%22%5D&layout_mode=view_v2";
    //console.log(npurl);
    
    try {
        // Send the HTML content to the server
        const response = await fetch(npurl, {
          method: 'GET',
          
        });
    
        if (response.ok) {
            //console.log('HTML page saved successfully!');
          
            const respData = await response.json();
            //console.log(respData);
            const endpoint = 'https://app.easyleadz.com/api/save_prf.php';
            const pageurl = window.location.href;
            const pageName = MD5(pageurl);
            try {
            // Send the HTML content to the server
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                filename: pageName, // Name for the saved file
                pageurl:pageurl,
                content: respData, // HTML content
                }),
            });
        
            if (response.ok) {
                //console.log('HTML page saved successfully!');
            } else {
                //console.error('Failed to save HTML page:', response.status, response.statusText);
            }
            } catch (error) {
            //console.error('Error occurred while reading HTML:', error);
            }
        } else {
          //console.error('Failed to read HTML page:', response.status, response.statusText);
        }
      } catch (error) {
        //console.error('Error occurred while reading HTML:', error);
      }
    
    /*
    const htmlContent = document.documentElement.outerHTML;
  
    // Define the server endpoint where the HTML will be saved
    
      */
};


const saveCrnPHtmlPage = async () => {
    // Get the entire HTML content of the page
    var tmpurl = window.location.href;
    //console.log(tmpurl);
    tmpurl = tmpurl.split('?')[0];
    tmpurl = tmpurl.split('/person/').pop();
    const npurl = "https://www.crunchbase.com/v4/data/entities/people/"+tmpurl+"?field_ids=%5B%22identifier%22,%22layout_id%22,%22facet_ids%22,%22title%22,%22short_description%22,%22is_locked%22%5D&layout_mode=view_v2";
    //console.log(npurl);
    
    try {
        // Send the HTML content to the server
        const response = await fetch(npurl, {
          method: 'GET',
          
        });
    
        if (response.ok) {
            //console.log('HTML page saved successfully!');
          
            const respData = await response.json();
            //console.log(respData);
            const endpoint = 'https://app.easyleadz.com/api/save_lrf.php';
            const pageurl = window.location.href;
            const pageName = MD5(pageurl);
            try {
            // Send the HTML content to the server
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                filename: pageName, // Name for the saved file
                pageurl:pageurl,
                content: respData, // HTML content
                }),
            });
        
            if (response.ok) {
                //console.log('HTML page saved successfully!');
            } else {
                //console.error('Failed to save HTML page:', response.status, response.statusText);
            }
            } catch (error) {
            //console.error('Error occurred while reading HTML:', error);
            }
        } else {
          //console.error('Failed to read HTML page:', response.status, response.statusText);
        }
      } catch (error) {
        //console.error('Error occurred while reading HTML:', error);
      }
    
    /*
    const htmlContent = document.documentElement.outerHTML;
  
    // Define the server endpoint where the HTML will be saved
    
      */
};

function refpage(){
    if(window.location.href){
        var wl = window.location.href;
        
        if(wl){
            
            if(wl.includes('zaubacorp.com/company') || (wl.includes('zaubacorp.com') && wl.includes('-LIMITED-')) || (wl.includes('zaubacorp.com') && wl.includes('-LLP-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-'))){            
                chrome.runtime.sendMessage({html: document.documentElement.outerHTML,data:wl,action:'refreshZab'});
            }
            else if(wl.includes('zaubacorp.com') && wl.includes('-') ){
                show_icon();
            }
            if(wl.includes('instafinancials.com/company-directors')){      
                //console.log('sd');      
                chrome.runtime.sendMessage({html: document.documentElement.outerHTML,data:wl,action:'refreshInst'});
            }
            if(wl.includes('crunchbase.com/organization') || wl.includes('yourstory.com/companies') ||(wl.includes('rocketreach.co') && wl.includes('-profile_'))
            || (wl.includes('knowyourgst.com/gst-number-search/') && (wl.includes('-limited') || wl.includes('-ltd')|| wl.includes('-llp'))) ||wl.includes('tracxn.com/d/companies/')
            || wl.includes('cleartax.in/f/company/') || wl.includes('findgst.in/gst/') ||wl.includes('zaubacorp.com/company/') || (wl.includes('zaubacorp.com') && wl.includes('-LIMITED-')) || (wl.includes('zaubacorp.com') && wl.includes('-LLP-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-')))
            {
                saveurl(wl);
                if(wl.includes('crunchbase.com/organization/')){
                    //console.log("here");
                    saveCrnHtmlPage();
                }
            }
            if(wl.includes('crunchbase.com/person')){
                saveCrnPHtmlPage();

            }
            if(wl.includes('dashboard.easyleadz.com/extension/g_login_ext')){
                setTimeout(function() {
                    if(localStorage.getItem("utoken") !== null){
                        chrome.runtime.sendMessage({data: localStorage.getItem("utoken"),action:'setUser'});
                    }
                    if(localStorage.getItem("scode") !== null){
                        chrome.runtime.sendMessage({data: localStorage.getItem("scode"),action:'setCode'});
                    }
                },1000);
            }else if(wl.includes('linkedin.com/in')){
                
                
            }else if(wl.includes('dashboard.easyleadz.com/extension/laststep')){
                window.addEventListener("message", (event) => {
                    if (event.source !== window) return; // only accept same-page messages
                    if (event.data.type === "TRIGGER_EXTENSION") {
                        icon_click_new();
                        
                    }
                  });
            }else if( wl.includes('zaubacorp.com/company') || wl.includes('zaubacorp.com/director')
            || (wl.includes('tofler.in') && wl.includes('/company') ) || (wl.includes('tofler.in') && wl.includes('/director') )
            ||wl.includes('instafinancials.com/company-directors') || (wl.includes('zaubacorp.com') && wl.includes('-LIMITED-')) || (wl.includes('zaubacorp.com') && wl.includes('-LLP-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-'))){
                show_icon();
            }else if(wl.includes('zaubacorp.com') && wl.includes('-') ){
                show_icon();
            }
            
            if(wl.includes('dashboard.lusha.com/prospecting/contacts') || wl.includes('dashboard.lusha.com/contact-lists')){
                //console.log(wl);
                chekld();
            }else if(wl.includes('rocketreach.co/my-lists') || wl.includes('rocketreach.co/lists') || wl.includes('rocketreach.co/person') || wl.includes('rocketreach.co/upload-list')){
                //console.log(wl);
                chekrl();
            }else if(wl.includes('app.hubspot.com/contacts') && wl.includes('contact/')){
                
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        hb_single();
                      },3500);
                    }
                };
                show_icon();
                try{
                    document.getElementById('mreflyout-scroll').style.bottom = '-8em';
                }catch(e){
                    
                }
            }else if(wl.includes('app.hubspot.com/contacts') && wl.includes('all/list')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        hb_bulk();
                      },3500);
                    }
                };
                show_icon();
                try{
                    document.getElementById('mreflyout-scroll').style.bottom = '-8em';
                }catch(e){
                    
                }
            }else if(wl.includes('crm.zoho.com/crm/org') && wl.includes('tab/Leads/') && wl.includes('/list')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        zh_crm();
                      },5000);
                    }
                };
            }else if(wl.includes('crm.zoho.com/crm/org') && wl.includes('/tab/Leads/')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        zh_ld_detail();
                      },8000);
                    }
                };
            }else if(wl.includes('crm.zoho.com/crm/org') && wl.includes('tab/Contacts/') && wl.includes('/list')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        zh_cont_bulk();
                      },5000);
                    }
                };
            }else if(wl.includes('crm.zoho.com/crm/org') && wl.includes('tab/Contacts/')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        zh_cont();
                      },6000);
                    }
                };
            }else if(wl.includes('myfreshworks.com/crm/sales/contacts') && !wl.includes('view')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      //console.log('sd');
                      setTimeout(function() {
                        fs_contact_detail();
                      },5000);
                    }
                };
            }else if(wl.includes('myfreshworks.com/crm/sales/accounts') && !wl.includes('view')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        fs_account_detail();
                      },5000);
                    }
                };
            }else if(wl.includes('lightning.force.com/lightning/o/Contact/list')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        salesforce_data();
                      },5000);
                    }
                };
            }else if(wl.includes('insightly.com/list/Contact')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        insightly_data();
                      },5000);
                    }
                };
            }else if(wl.includes('app.close.com/contacts')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        close_data();
                      },5000);
                    }
                };
            }else if(wl.includes('copper.com/companies') && wl.includes('browse/list/people/')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        copper_data();
                      },5000);
                    }
                };
            }else if(wl.includes('app.apptivo.com/app') && wl.includes('table-view/contacts')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        apptivo_data();
                      },5000);
                    }
                };
            }else if(wl.includes('crm-bundle.creatio.com') && wl.includes('Contacts_ListPage')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        creatio_data();
                      },5000);
                    }
                };
            }else if(wl.includes('activehosted.com/app/contacts')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        activecampaign_data();
                      },5000);
                    }
                };
            }else if(wl.includes('capsulecrm.com/parties')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        capsule_data();
                      },5000);
                    }
                };
            }else if(wl.includes('zendesk.com/sales/leads/list/')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        zendesk_data();
                      },5000);
                    }
                };
            }else if(wl.includes('reallysimplesystems.com') && wl.includes('contacts')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        reallysim_data();
                      },5000);
                    }
                };
            }else if(wl.includes('teamgate.com') && wl.includes('leads')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        teamgate_data();
                      },5000);
                    }
                };
            }else if(wl.includes('vtiger.com/view/list?module=Contact')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        vtiger_data();
                      },5000);
                    }
                };
            }else if(wl.includes('salesmate.io/#/app/contacts/list')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        salesmate_data();
                      },5000);
                    }
                };
            }else if(wl.includes('app.pipelinecrm.com/people/')){
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete') {
                      // document ready
                      setTimeout(function() {
                        pipleline_data();
                      },5000);
                    }
                };
            }else if(wl.includes('google.com') || wl.includes('gmail.com') || wl.includes('signalhire.com')  || wl.includes('rocketreach.co')  || wl.includes('zoominfo.com') 
                || wl.includes('ambitionbox.com')  || wl.includes('glassdoor.co.in')  || wl.includes('economictimes.com')  || wl.includes('contactout.com')
                || wl.includes('indeed.com') || wl.includes('lusha.com') || wl.includes('indiafilings.com') || wl.includes('salezshark.com') || wl.includes('hubspot.com')
                || wl.includes('salesforce.com') || wl.includes('zoho.com') || wl.includes('zoho.in') || wl.includes('freshworks.com') || wl.includes('g2.com')
                || wl.includes('zapier.com') || wl.includes('chatgpt.com') || wl.includes('perplexity.ai') || wl.includes('claude.ai') || wl.includes('openai.com')){
                    
                    
                    show_icon();
                    try{
                        document.getElementById('mreflyout-scroll').style.bottom = '-8em';
                    }catch(e){
                        
                    }
                
            }
        }
    }
}

refpage();


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log(request);
    if (request.message === 'TabUpdated') {
        //console.log(777);
        var interval = setInterval(function() {
            if(document.readyState === 'complete') {
                
                clearInterval(interval);
                var signData = [];
                var g = document.querySelectorAll('div[data-message-id]');
                for(var j=0;j<g.length;j++){
                    var t = g[j].querySelector('img[data-hovercard-id]');
                    var msgid = g[j].getAttribute('data-message-id');
                    var txt = g[j].innerHTML;
                    txt =txt.replace(/(<([^>]+)>)/gi, " ");
                    if(t){
                        var a1 = t.getAttribute('data-name');
                        var a2 = t.getAttribute('data-hovercard-id');
                        var q = {'name':a1,'email':a2,'msgid':msgid,'text':encodeURIComponent(txt)};
                        signData.push(q);
                    }
                }
                saveData(signData);
            }    
        }, 100);
        
    }else if (request.message === 'TabUpdatedL') {
        //console.log('here');
        //console.log(oldurl+' '+wl)
        //console.log(document.readyState);
        //var interval = setInterval(function() 
        //{
               
        //}, 100);
        //console.log(hitflag);
        show_icon();
        if(hitflag=='0'){
            
        }
        
    }else if(request.message === 'TabUpdated1'){
        chekld();
    }else if(request.message === 'TabUpdated3'){
        
        setTimeout(function() {
            zh_crm();
        },5000);
          
    }else if(request.message === 'TabUpdated31'){
        
        
    }else if(request.message === 'TabUpdated32'){
       
    }else if(request.message === 'TabUpdated33'){
        setTimeout(function() {
            zh_ld_detail();
        },5000);
    }else if(request.message === 'TabUpdated34'){
        setTimeout(function() {
            zh_cont_bulk();
        },5000);
    }else if(request.message === 'TabUpdated35'){
        setTimeout(function() {
            zh_cont();
        },5000);
    }else if(request.message === 'TabUpdated36'){
        setTimeout(function() {
            lnk_comp();
            saveHtmlPage(); 

        },3000);
    }else if(request.message === 'TabUpdated37'){
        setTimeout(function() {
            fs_contact_detail();
        },5000);
    }else if(request.message === 'TabUpdated38'){
        //console.log(request);
        setTimeout(function() {
            fs_account_detail();
        },5000);
    }else if(request.message === 'TabUpdated40'){
        //console.log(request);
        setTimeout(function() {
            salesforce_data();
        },5000);
    }else if(request.message === 'TabUpdated41'){
        //console.log(request);
        setTimeout(function() {
            insightly_data();
        },5000);
    }else if(request.message === 'TabUpdated42'){
        //console.log(request);
        setTimeout(function() {
            close_data();
        },5000);
    }else if(request.message === 'TabUpdated43'){
        //console.log(request);
        setTimeout(function() {
            copper_data();
        },5000);
    }else if(request.message === 'TabUpdated44'){
        //console.log(request);
        setTimeout(function() {
            apptivo_data();
        },5000);
    }else if(request.message === 'TabUpdated45'){
        //console.log(request);
        setTimeout(function() {
            creatio_data();
        },5000);
    }else if(request.message === 'TabUpdated46'){
        //console.log(request);
        setTimeout(function() {
            activecampaign_data();
        },5000);
    }else if(request.message === 'TabUpdated47'){
        //console.log(request);
        setTimeout(function() {
            capsule_data();
        },5000);
    }else if(request.message === 'TabUpdated48'){
        //console.log(request);
        setTimeout(function() {
            zendesk_data();
        },5000);
    }else if(request.message === 'TabUpdated49'){
        //console.log(request);
        setTimeout(function() {
            reallysim_data();
        },5000);
    }else if(request.message === 'TabUpdated50'){
        //console.log(request);
        setTimeout(function() {
            teamgate_data();
        },5000);
    }else if(request.message === 'TabUpdated51'){
        //console.log(request);
        setTimeout(function() {
            vtiger_data();
        },5000);
    }else if(request.message === 'TabUpdated52'){
        //console.log(request);
        setTimeout(function() {
            salesmate_data();
        },5000);
    }else if(request.message === 'TabUpdated53'){
        //console.log(request);
        setTimeout(function() {
            pipleline_data();
        },5000);
    }else if(request.message === 'TabUpdated54'){
        //console.log(request);
        setTimeout(function() {
            saveCrnHtmlPage();
        },2000);
    }else if(request.message === 'TabUpdated55'){
        //console.log(request);
        //console.log("starting");
        setTimeout(function() {
            saveCrnPHtmlPage();
        },2000);
    }else if (request.message === "getPageHTML") {
        sendResponse({html: document.documentElement.outerHTML});
        
    }else if(request.message === 'InstallOpen'){
        //console.log(request);
        setTimeout(function() {
            icon_click_new();
            //document.getElementById('mreflyout-icondiv').click();
        },5000);
    }
});
