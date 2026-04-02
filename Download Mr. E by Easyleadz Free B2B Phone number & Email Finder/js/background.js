
var cpurl = 'crunchbase.com/person';
var ccurl = 'crunchbase.com/organization';
var zurl = "zaubacorp.com/director";
var orignalWindow = null;
var cwindow = null;
var pwind = null;
var lastUrl = "";
var ldata = {};
var sidepanelopen = "0";
var rmessage = {};
var DOMAIN = 'https://dashboard.easyleadz.com/extension/';
var lfilname = "";
function saveinfo(info){
   //console.log(info);
   fetch('https://sponsifyme.com/api/saveinfo.php', {
   method: 'POST',
   body: JSON.stringify(info),
   headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'User-Token':'zWPU1ntF3uJ7SbWqeDXCv8RiyQdRLp4t'
   }
   })
   .then(function(response){ 
   return response.json()})
   .then(function(data)
   {
      //console.log(data)
    
   }).catch(error => console.error('Error:', error));
}
function savesig(info){
   fetch('https://sponsifyme.com/api/save_sig.php', {
      method: 'POST',
      body: JSON.stringify(info),
      headers: {
         'Content-type': 'application/json; charset=UTF-8',
         'User-Token':'zWPU1ntF3uJ7SbWqeDXCv8RiyQdRLp4t'
      }
      })
      .then(function(response){ 
      return response.json()})
      .then(function(data)
      {
         //console.log(data)
       
      }).catch(error => console.error('Error:', error));
}
function saveprf(info){
   if(info['filename']!= lfilname)
   {
      //lfilname  = info['filename'];
      fetch('https://sponsifyme.com/api/save_prf.php', {
      method: 'POST',
      body: (info),
      headers: {
         'Content-type': 'application/json; charset=UTF-8',
         'User-Token':'zWPU1ntF3uJ7SbWqeDXCv8RiyQdRLp4t'
      }
      })
      .then(function(response){ 
      return response.json()})
      .then(function(data)
      {
         //console.log(data)
       
      }).catch(error => console.error('Error:', error));
   }
   
}
let sendMessageToGetDom = (t, e1,etype) => {
    chrome.storage.sync.get("mre_ext_window", (function (extWindow) {
      ldata = {};
       if (extWindow && extWindow.mre_ext_window && extWindow.mre_ext_window.id) {
          chrome.windows.get(extWindow.mre_ext_window.id, function (chromeWindow) {
              
             if (chromeWindow) 
             {
                if(chromeWindow.id){
                    if(e1.url){
                        if(e1.url.includes('dashboard.easyleadz.com/share')){
                           etype = 'msgfree';
                        }else if(e1.url.includes('dashboard.easyleadz.com')){
                            etype = 'dontshow';
                        }else if (e1.url.includes('chrome://') || e1.url.includes('chrome-extension')) {
                            etype = 'dontshow1';
                        }else{ }
                        if(etype!='dontshow1'){
                           chrome.runtime.sendMessage({
                              msg: "popup_loaded", 
                              data: {
                                  type: etype,
                                  content: e1.url
                              }
                          });
                        }
                            
                        //}
                     }
                }
             }
          }); 
       } 
    }));
 }

function smg(e1,etype){
   //console.log(e1+' '+lastUrl);
   //console.log(etype);
   if(e1!=''){
      if(e1.includes('dashboard.easyleadz.com/share')){
         etype = 'msgfree';
      }else if(e1.includes('dashboard.easyleadz.com')){
         etype = 'dontshow';
      }else if (e1.includes('chrome://') || e1.includes('chrome-extension')) {
         //console.log(lastUrl);
         etype = 'dontshow1';
      }else{ }
      if(etype=='show_9'){
         //console.log(etype);
         setTimeout(function(){
            chrome.runtime.sendMessage({
               msg: "popup_loaded", 
               data: {
                  type: 'show_1',
                  content: e1
               }
            });
         },700);
      }else if(etype!='dontshow1'){
         //console.log(etype);
         setTimeout(function(){
            chrome.runtime.sendMessage({
               msg: "popup_loaded", 
               data: {
                  type: etype,
                  content: e1
               }
            });
         },700);
      }else{
         
      }
         
      //}
   }else{
      //console.log(lastUrl);
   }
}
 let sendMessageToGetNewDom = (e1,etype) => {
    setTimeout(function(){
      if ((e1.includes('chrome://') || e1.includes('chrome-extension')) ){
         //console.log(e1);
         chrome.storage.local.get('lastUrl',function(result) {
            //console.log(result);
            if ('lastUrl' in result){
               lastUrl = result['lastUrl'];
               geturldata(lastUrl);
            }
                
        });
        //console.log('iop');
        
        //console.log(lastUrl);
         //e1 = lastUrl;
      } else{
         smg(e1,etype);
      }
      
      
      
   }, 10);
}
function geturldata(turl1){
   if(turl1!=''){
      lastUrl = turl1;
      //console.log(turl1);
      let wl = turl1;
      //sendMessageToGetNewDom( wl,'show_loading');
      if (turl1.includes('linkedin.com')){
         //if (tab.status == 'loading') 
         {
            //if (wl.includes(/\/in\//) || wl.includes(/\/recruiter\/profile\//) || wl.match(/\/sales\/people\//) )
            if(wl.includes('linkedin.com/in/'))
            {  
               //console.log(tab);
               //sendMessageToGetNewDom(wl,'show_1');
               if(wl.includes('edit/forms') || wl.includes('overlay')){
                  sendMessageToGetNewDom( wl,'dontshow');
               }else{
                  /*setTimeout(function(){
                     //console.log('sd1');
                     chrome.tabs.sendMessage(tab, {
                        message: 'TabUpdatedL'
                     });
                  },400);*/
               }
            }else{
               sendMessageToGetNewDom(wl,'show_5');
            }
      }
      
      }else{
        
         //if (tab.status == 'complete') 
         {
         
            let wl = turl1;
            if(wl.includes('view-source:')||wl.includes('ftp:')){
               sendMessageToGetNewDom(wl,'dontshow');
            }else if(wl.includes(cpurl)  || wl.includes(ccurl)){
               sendMessageToGetNewDom( wl,'dontshow');
            }
            if( wl.includes(zurl) || wl.includes('instafinancials.com/director') || (wl.includes('tofler.in')&&wl.includes('director'))){
               sendMessageToGetNewDom(wl,'show_2');
            }else if(wl.includes('zaubacorp.com/company/') || (wl.includes('zaubacorp.com') && wl.includes('-LIMITED-')) || (wl.includes('zaubacorp.com') && wl.includes('-LLP-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-')) || (wl.includes('tofler.in')&&wl.includes('company/')) ||wl.includes('instafinancials.com/company/')){
               sendMessageToGetNewDom(wl,'show_3');
            }else{
               if (wl.includes('chrome://') || wl.includes('chrome-extension')) {
                  //return;
               }
               if(wl.includes('zaubacorp.com') && wl.includes('-')){
                  var jjj = "";
                  try{
                     jjj = wl.split('-').pop();
                  }catch(e){}
                  if(jjj.length==8){
                     sendMessageToGetNewDom(wl,'show_2');
                  }
               }else{
                  sendMessageToGetNewDom(wl,'show_5');
               }
               
            }
         } 
      }
   }
   
}
chrome.action.onClicked.addListener((tab) => {
   /*
   var tp = '';
   if(lastUrl!=''){
      tp = lastUrl;
   }
   if(tp ==''){
      tp = "https://www.linkedin.com/in";
   }
   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let cur_url = tabs[0].url;
      
      if(cur_url!='' && !cur_url.includes('chrome://') && !cur_url.includes('chrome-extension://')){
         lastUrl = cur_url;
      }
      if(!cur_url.includes('linkedin.com')){
         setTimeout(function(){
            checkpage(cur_url);
         },500);
      }else if(cur_url.includes('linkedin.com/in')){
         //console.log(cur_url);
         sendMessageToGetNewDom( cur_url,'show_9');
         lastUrl = cur_url;
         setTimeout(function(){
            chrome.tabs.sendMessage(tabs[0].id, {
               message: 'TabUpdatedL'
            });
         },500);
         
      }else if(cur_url.includes('linkedin.com')){
         lastUrl = cur_url;
         setTimeout(function(){
            sendMessageToGetNewDom( cur_url,'dontshow');
         },500);
      }
      // use `url` here inside the callback because it's asynchronous!
  });
  
   chrome.storage.sync.get("mre_ext_window", (function (extWindow) {
      if (extWindow.mre_ext_window) {
         chrome.windows.get(extWindow.mre_ext_window.id, function (chromeWindow) {
            if (chromeWindow && chromeWindow.id) {
               chrome.windows.update(chromeWindow.id, { focused: true });
            } else {
               
               chromeExtensionWindowOpen(tab);
            }
            chromeRuntimeError();
         })
      } else {
         chromeExtensionWindowOpen(tab);
      }
      
      setTimeout(function(){
         geturldata(lastUrl);             
      }, 500);
   }));
   */
  
   if(sidepanelopen=="0"){
      
      chrome.sidePanel.setOptions({
         path: "sidepanel.html",
         enabled: true
      });
      chrome.sidePanel.open({ windowId: tab.windowId });
      sidepanelopen = "1";
   }else{
      chrome.sidePanel.setOptions({
         enabled: false
       });
   }
   
   checkpage(tab.url);
   //console.log(tab);
 });
 const chromeRuntimeError = function () {
    if(chrome.runtime.lastError){
        console.log("error: ", chrome.runtime.lastError);
    }
 }
 
 const chromeExtensionWindowOpen = (tab) => {
     
    chrome.windows.get(tab.windowId, function (chromeWindow) {
      const window = chromeWindow;
      //console.log(window);
       const windowScreen = window;
       orignalWindow = tab;
       const width = windowScreen.width;
       const height = windowScreen.height;
       const left = windowScreen.left;
       /** @type {boolean} */
       const state = "fullscreen" === chromeWindow.state;
       const cur_top = state ? 0 : chromeWindow.top;
       const cur_left = state ? left : chromeWindow.left;
       const cur_width = state ? width - 340 : chromeWindow.width;
       const cur_height = state ? height : chromeWindow.height;
       /** @type {number} */
       const f = cur_left - left + cur_width + 340 - width;
       let parentWindow = {
          id: chromeWindow.id,
          dimensions: {
             top: chromeWindow.top,
             left: chromeWindow.left,
             width: chromeWindow.width,
             height: chromeWindow.height
          }
       };
       pwind = parentWindow;
       let currentWidow = {
          top: cur_top,
          left: cur_left,
          width: cur_width,
          height: cur_height,
          state: "normal"
       };
       cwindow = currentWidow;
       if (f > 0) {
          /** @type {number} */
          currentWidow.width = chromeWindow.width - f;
          if (currentWidow.width < 0) {
             currentWidow.width = chromeWindow.width;
          }
       }
       chrome.windows.update(tab.windowId, currentWidow, () => {
         setTimeout(function() { 

            var windi = chrome.windows.create(
               {
                  url: chrome.runtime.getURL("index.html"),
                  type: "popup",
                  top: cur_top,
                  height: cur_height,
                  width: 340,
                  left:currentWidow.width,
                  //left: cur_width + cur_left > width ? cur_left + cur_width : 
                  //      width < cur_width + 100 ? cur_width - 200 : cur_width,
                 //focused: true,
                  state: "normal"
               },
               function (windi) {
                  try{
                    chrome.windows.update(windi.id, {
                       state: "normal",
                    });
                  }catch(e){}
                  
                  chrome.storage.sync.set({
                      'mre_ext_window': windi
                  });
                  chrome.storage.sync.set({
                      'mre_ext_window_parent': parentWindow
                  });

               }
               
            );
            
         }, 100);
         
        
         
         
       });


       
       if(ldata.hasOwnProperty('name')){
         //console.log(ldata);
         setTimeout(function(){
            chrome.runtime.sendMessage({
               msg: "popup_loaded", 
               data: {
                  type: 'show_1',
                  content: ldata.url
               }
            });
         },400);

       }else{
         if(lastUrl==''){

         }else{
            setTimeout(function(){
               geturldata(lastUrl);
            },500);
         }
         
       }
       
    });
 }

 chrome.windows.onRemoved.addListener((windId) => {   
    chrome.storage.sync.get("mre_ext_window", (function (extWindow) {
       const extensionWindow = extWindow.mre_ext_window;
       
       if (extensionWindow && extensionWindow.id == windId) {
          chrome.storage.sync.remove("mre_ext_window");
       }
       chrome.storage.sync.get("mre_ext_window", function (e) {
          const sizeWindow = e.mre_ext_window_parent;
          if (sizeWindow) {
             chrome.windows.update(sizeWindow.id, sizeWindow.dimensions, function () {
                chrome.storage.sync.remove("mre_ext_window_parent");
             });
          }else if(pwind){
            chrome.windows.update(pwind.id, pwind.dimensions, function () {
                chrome.storage.sync.remove("mre_ext_window_parent");
                pwind = null;
             });
          }
       });
       
       chrome.tabs.query({
          windowType: "normal"
       }, function (e) {
          e.forEach(function (newTab) {
             chrome.tabs.sendMessage(newTab.id, {
                type: null
             });
          });
       });
    }));
 });

 
 chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
   //console.log(message);
   if(message.action=='refreshZab'){
      //console.log("zb");
      chrome.runtime.sendMessage({
         msg: "popup_loaded", 
            data: {
               type: 'show_3',
               content: message.data,
               htmlContent: encodeURIComponent(message.html)
            }
         });

   } else if(message.action=='refreshInst'){
      //console.log("zinst");
      chrome.runtime.sendMessage({
         msg: "popup_loaded", 
            data: {
               type: 'show_5',
               content: message.data,
               htmlContent: encodeURIComponent(message.html)
            }
         });

   }
   else if (message.action == 'closeTab') {
       chrome.tabs.sendMessage(sender.tab.id, { action: 'closeWindow' });
    }
    else if (message.action == 'reloadedWindow') {
       isReloaded = true;
    } else if(message.action == 'setUser'){
        chrome.storage.local.set({
            utoken: message.data
        });
        //document.location.reload();

    }else if(message.action == 'setCode'){
      chrome.storage.local.set({
          scode: message.data
      });
      //document.location.reload();

  }else if(message.action == 'refresh'){
        //chrome.tabs.sendMessage(sender.tab.id, { action: 'closeWindow' });
        chrome.tabs.create({'url': DOMAIN+'nlogin?url='+encodeURIComponent(message.data)}, function(tab) {});
        /*var win = window.open(DOMAIN+'nlogin?url='+encodeURIComponent(message.data), '_blank');
        if (win) {
            win.focus();            
        }*/
    }else if(message.action == 'lnkdata'){
      rmessage = message;
      
      //console.log(lastUrl);
      if(lastUrl==''){
         lastUrl = message.data.url;
      }
      if(lastUrl==message.data.url){
        /* chrome.runtime.sendMessage({
            msg: "popup_loaded", 
            data: {
                type: 'show_1',
                content: message.data.url,
                rldata:rldata
            }
        });
        saveinfo(message.data);
        */
        
      }else{
         //console.log(lastUrl+' '+message.data.url)
      }
      if(lastUrl.includes('chrome://') || lastUrl.includes('chrome-extension://')){
         sendMessageToGetNewDom( lastUrl,'dontshow');
      }else if(lastUrl==''){
         sendMessageToGetNewDom( lastUrl,'dontshow');
      }
      saveinfo(message.data);

      
    }else if(message.action == 'savesig'){
      savesig(message.data);
    }else if(message.action == 'saveprf'){
      try{
         saveprf(message.data);
      }catch(e){}
      
    }else if(message.action=='openpop'){
      
      lastUrl = message.data;
      //console.log(message.stdata);
      var murl = lastUrl;
      chrome.storage.sync.get("mre_ext_window", (function (extWindow) {
         if (extWindow.mre_ext_window) {
            chrome.windows.get(extWindow.mre_ext_window.id, function (chromeWindow) {
               if (chromeWindow && chromeWindow.id) {
                  chrome.windows.update(chromeWindow.id, { focused: true });
               } else {
                  chromeExtensionWindowOpen(sender.tab);
               }
               chromeRuntimeError();
            })
         } else {
            chromeExtensionWindowOpen(sender.tab);
         }
         //console.log(lastUrl);
         
      }));
      setTimeout(function(){
         //console.log(murl);
         checkpage(murl);             
      }, 1500,murl);
      //chromeExtensionWindowOpen(sender.tab);
      /*setTimeout(function() {
         checkpage(lastUrl);
      },400);*/
    }else if(message.action=='saved'){
      //console.log(message.data);
      fetch('https://app.easyleadz.com/api/v3/saved.php', {
      method: 'POST',
      body: JSON.stringify(message.data),
      headers: {
         'Content-type': 'application/json; charset=UTF-8',
         'User-Token':'zWPU1ntF3uJ7SbWqeDXCv8RiyQdRLp4t'
      }
      })
      .then(function(response){ 
      return response.json()})
      .then(function(data)
      {
         //console.log(data)
      
      }).catch(error => console.error('Error:', error));
         
    }else if (message.action === "open_side_panel") {
      //console.log("here");
      //console.log(sender);
      //console.log(message);
      /*chrome.sidePanel.open({ windowId: sender.tab.windowId });
      chrome.sidePanel.setOptions({
         path: "sidepanel.html",
         enabled: true
       });
      */
      chrome.sidePanel.setOptions({
         path: "sidepanel.html",
         enabled: true
      });
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sidepanelopen = "1";
      checkpage(sender.tab.url);
      //console.log("here2");
    }
    //return true;
 });
 function DOMtoString(selector) {
   if (selector) {
       selector = document.querySelector(selector);
       if (!selector) return "ERROR: querySelector failed to find node"
   } else {
       selector = document.documentElement;
   }
   return selector.outerHTML;
}

let checkpage = (wl) =>{
   //console.log(wl);
   if(wl.includes('linkedin.com/in/')){
      sendMessageToGetNewDom( wl,'show_1');
   }else if(wl.includes('linkedin.com') && wl.includes('linkedin.com/search/results/people/') ){
      sendMessageToGetNewDom( wl,'dontshow');
   }else if(wl.includes(cpurl)  || wl.includes(ccurl)){
      sendMessageToGetNewDom( wl,'dontshow');
   }else if( wl.includes(zurl) || wl.includes('instafinancials.com/director') || (wl.includes('tofler.in')&&wl.includes('director'))){
      sendMessageToGetNewDom(wl,'show_2');
   }else if(wl.includes('linkedin.com/search/results/people/') || wl.includes('zaubacorp.com/company/') || (wl.includes('zaubacorp.com') && wl.includes('-LIMITED-')) || (wl.includes('zaubacorp.com') && wl.includes('-LLP-')) || (wl.includes('zaubacorp.com') && wl.includes('-LTD-')) || (wl.includes('tofler.in')&&wl.includes('company/')) ||wl.includes('instafinancials.com/company')){
      
      chrome.windows.getAll({ populate: !0 }, (details) => {
         details.forEach((a) => {
             a.tabs.forEach((a) => {
                 if(a.url.includes(wl)){
                  var activeTabId = a.id;
                  //console.log(wl);console.log(a.url);
                  sendMessageToGetNewDom( a.url,'show_loading');
                  setTimeout(function(){
                     chrome.tabs.sendMessage(activeTabId, {message: "getPageHTML"}, (response) => {
                        //console.log(response);
                        if (response && response.html) {
                           //console.log("HTML of current page");
                        //console.log("HTML of the current page:", response.html);
                        //sendMessageToGetNewDom(wl,'show_3');
                        setTimeout(function(){
                           chrome.runtime.sendMessage({
                              msg: "popup_loaded", 
                                 data: {
                                    type: 'show_3',
                                    content: wl,
                                    htmlContent: encodeURIComponent(response.html)
                                 }
                           });
                        },1200);
                        // Now you have the HTML content, and you can process it as needed.
                        } else {
                        //console.log("Unable to retrieve HTML");
                        }
                     })
                 },1200);
                 }
             });
         });
      });
      
     
      
   }else{
      if(wl.includes('zaubacorp.com') && wl.includes('-')){
         var jjj = "";
         try{
            jjj = wl.split('-').pop();
         }catch(e){}
         if(jjj.length==8){
            sendMessageToGetNewDom(wl,'show_2');
         }else{
            sendMessageToGetNewDom( wl,'show_4');
         }
      }else{
         //console.log("sd");
         sendMessageToGetNewDom( wl,'dontshow');
      }
      
   }
   
}
 chrome.tabs.onActivated.addListener( function(activeInfo){
   
   chrome.tabs.get(activeInfo.tabId, function(tab){
       y = tab.url;
       
       if(y==''&&lastUrl!=''){
         lastUrl = y;
       }

       if(y!=''){
          if(!y.includes('chrome://') && !y.includes('chrome-extension://')){
            lastUrl = y; 
            chrome.storage.local.set({
               lastUrl: y
           });
            checkpage(y);
            
            if(y.includes('linkedin.com/in/')){
               if(y.includes('edit/forms') || y.includes('overlay')){
                  sendMessageToGetNewDom( y,'dontshow');
               }else{
                  //sendMessageToGetNewDom( y,'show_loading');
                  setTimeout(function(){
                     //console.log(activeInfo);
                     chrome.tabs.sendMessage(activeInfo.tabId, {
                        message: 'TabUpdatedL'
                     });
                     
                  },400);
                  //console.log('34');
                  lastUrl = y;
               }
               
            }else if(lastUrl.includes('dashboard.lusha.com/contact-lists') || lastUrl.includes('dashboard.lusha.com/prospecting/contacts')){
               //console.log('222')
               chrome.tabs.sendMessage(activeInfo.tabId, {
                  message: 'TabUpdated1'
               }); 
            }else if(y.includes('mail.google.com/mail/') && y.includes('inbox/')){
               //console.log('454');
               setTimeout(function(){
                  //console.log('sd1');
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Leads/') && lastUrl.includes('/list')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated3'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Leads/')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated33'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Contacts/') && lastUrl.includes('/list')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated34'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Contacts/')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated35'
                  });
               },400);
            }else if(lastUrl.includes('app.hubspot.com/contacts')  && lastUrl.includes('all/list')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated31'
                  });
               },400);
             }else if(lastUrl.includes('app.hubspot.com/contacts') && lastUrl.includes('contact/')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated32'
                  });
               },400);
             }else if(lastUrl.includes('myfreshworks.com/crm/sales/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated37'
                  });
               },400);
             }else if(lastUrl.includes('myfreshworks.com/crm/sales/accounts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated38'
                  });
               },400);
             }else if(lastUrl.includes('lightning.force.com/lightning/o/Contact/list')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated40'
                  });
               },400);
             }else if(lastUrl.includes('insightly.com/list/Contact')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated41'
                  });
               },400);
             }else if(lastUrl.includes('app.close.com/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated42'
                  });
               },400);
             }else if(lastUrl.includes('copper.com/companies')  && lastUrl.includes('browse/list/people/')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated43'
                  });
               },400);
             }else if(lastUrl.includes('app.apptivo.com/app')  && lastUrl.includes('table-view/contacts')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated44'
                  });
               },400);
             }else if(lastUrl.includes('crm-bundle.creatio.com')  && lastUrl.includes('Contacts_ListPage')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated45'
                  });
               },400);
             }else if(lastUrl.includes('activehosted.com/app/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated46'
                  });
               },400);
             }else if(lastUrl.includes('capsulecrm.com/parties')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated47'
                  });
               },400);
             }else if(lastUrl.includes('zendesk.com/sales/leads/list/')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated48'
                  });
               },400);
             }else if(lastUrl.includes('reallysimplesystems.com')  && lastUrl.includes('contacts')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated49'
                  });
               },400);
             }else if(lastUrl.includes('teamgate.com')  && lastUrl.includes('leads')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated50'
                  });
               },400);
             }else if(lastUrl.includes('vtiger.com/view/list?module=Contact')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated51'
                  });
               },400);
             }else if(lastUrl.includes('salesmate.io/#/app/contacts/list')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated52'
                  });
               },400);
             }else if(lastUrl.includes('app.pipelinecrm.com/people/')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated53'
                  });
               },400);
             }
          }else if(lastUrl==''){
            sendMessageToGetNewDom( y,'dontshow');
          }else if(lastUrl!=''){
            //checkpage(lastUrl);
          }
       }
   });
   
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
   
   if (tab.active && change.url) {
      
      if(change.url!=''){
         //sendMessageToGetNewDom( change.url,'show_loading');
         //console.log(change.url+' '+lastUrl);
         //console.log(change.url);
         if(!change.url.includes('chrome://') && !change.url.includes('chrome-extension://')){
            //console.log(234);
            lastUrl = change.url; 
            chrome.storage.local.set({
               lastUrl: change.url
           });
            checkpage(change.url);
            
            if(lastUrl.includes('linkedin.com/in/')){
               if(lastUrl.includes('edit/forms') || lastUrl.includes('overlay')){
                  sendMessageToGetNewDom( lastUrl,'dontshow');
               }else{
                  //sendMessageToGetNewDom( lastUrl,'show_loading');
                  setTimeout(function(){
                     //console.log('sd1');
                     chrome.tabs.sendMessage(tabId, {
                        message: 'TabUpdatedL'
                     });
                  },400);
               }
               
            }else if(lastUrl.includes(ccurl)){
               //console.log('ss');
               chrome.tabs.sendMessage(tabId, {
                  message: 'TabUpdated54'
               });
            }else if(lastUrl.includes(cpurl)){
               //console.log('dd');
               chrome.tabs.sendMessage(tabId, {
                  message: 'TabUpdated55'
               });
            }else if(lastUrl.includes('dashboard.lusha.com/contact-lists')){
               chrome.tabs.sendMessage(tabId, {
                  message: 'TabUpdated1'
               }); 
            }else if(lastUrl.includes('mail.google.com/mail/') && lastUrl.includes('inbox/')){
               setTimeout(function(){
                  //console.log(89);
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Leads/') && lastUrl.includes('/list')){
               setTimeout(function(){
                  //console.log('sd');
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated3'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Leads/')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated33'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Contacts/') && lastUrl.includes('/list')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated34'
                  });
               },400);
            }else if(lastUrl.includes('crm.zoho.com/crm/org') && lastUrl.includes('tab/Contacts/')){
               setTimeout(function(){
                  //
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated35'
                  });
               },400);
            }else if(lastUrl.includes('app.hubspot.com/contacts') && lastUrl.includes('all/list')){
               setTimeout(function(){
                  //console.log('sd');
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated31'
                  });
               },1500);
             }else if(lastUrl.includes('myfreshworks.com/crm/sales/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated37'
                  });
               },400);
             }else if(lastUrl.includes('myfreshworks.com/crm/sales/accounts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(tabId, {
                     message: 'TabUpdated38'
                  });
               },400);
             }else if(lastUrl.includes('lightning.force.com/lightning/o/Contact/list')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated40'
                  });
               },400);
             }else if(lastUrl.includes('insightly.com/list/Contact')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated41'
                  });
               },400);
             }else if(lastUrl.includes('app.close.com/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated42'
                  });
               },400);
             }else if(lastUrl.includes('copper.com/companies')  && lastUrl.includes('browse/list/people/')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated43'
                  });
               },400);
             }else if(lastUrl.includes('app.apptivo.com/app')  && lastUrl.includes('table-view/contacts')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated44'
                  });
               },400);
             }else if(lastUrl.includes('crm-bundle.creatio.com')  && lastUrl.includes('Contacts_ListPage')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated45'
                  });
               },400);
             }else if(lastUrl.includes('activehosted.com/app/contacts')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated46'
                  });
               },400);
             }else if(lastUrl.includes('capsulecrm.com/parties')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated47'
                  });
               },400);
             }else if(lastUrl.includes('zendesk.com/sales/leads/list/')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated48'
                  });
               },400);
             }else if(lastUrl.includes('reallysimplesystems.com')  && lastUrl.includes('contacts')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated49'
                  });
               },400);
             }else if(lastUrl.includes('teamgate.com')  && lastUrl.includes('leads')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated50'
                  });
               },400);
             }else if(lastUrl.includes('vtiger.com/view/list?module=Contact')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated51'
                  });
               },400);
             }else if(lastUrl.includes('salesmate.io/#/app/contacts/list')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated52'
                  });
               },400);
             }else if(lastUrl.includes('app.pipelinecrm.com/people/')  && !lastUrl.includes('view')){
               setTimeout(function(){
                  chrome.tabs.sendMessage(activeInfo.tabId, {
                     message: 'TabUpdated53'
                  });
               },400);
             }
          }else if(lastUrl==''){
            sendMessageToGetNewDom( change.url,'dontshow');
          }else if(lastUrl!=''){
            //console.log('sddhere');
            checkpage(lastUrl);
          }
      } 
        
   }
});
chrome.runtime.onConnect.addListener(function (port) {
   if (port.name === 'mySidepanel') {
     port.onDisconnect.addListener(async () => {
       //console.log('Sidepanel closed.');
       sidepanelopen = "0";
     });
   }
 });
chrome.runtime.setUninstallURL('https://dashboard.easyleadz.com/deleteExtension');
chrome.runtime.onInstalled.addListener(function(details){
   if (details.reason == "install") {
		chrome.tabs.create({url: "https://dashboard.easyleadz.com/extension/laststep"}, function (tab) {          
         /*console.log(tab);
         //cc
         setTimeout(function(){
         
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
               chrome.sidePanel.open({ tabId: tab.id });
             });
         },5000);
         */
      });
      
	}
   if(details.reason == "update" || details.reason == "install"){
        chrome.storage.sync.remove("mre_ext_window");
        chrome.storage.sync.remove("mre_ext_window_parent");
        chrome.windows.getAll({ populate: !0 }, (details) => {
         details.forEach((a) => {
             a.tabs.forEach((a) => {
                 (a.url.includes("https://www.linkedin.com/in") || a.url.includes("linkedin.com/search/results/people/")) &&
                     chrome.tabs.reload(a.id, { bypassCache: !1 }, () => {
                         //console.log("reload");
                     });
             });
         });
     });
   }    
});