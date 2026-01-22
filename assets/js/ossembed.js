function CreateWhatsappChatWidget(t={brandSetting:{autoShow:!0,backgroundColor:"#0a6114",borderRadius:"25",brandImg:"https://scrm-data-us-oss.oss-us-west-1.aliyuncs.com/sender/whatsapp_replace_crisp/logo.png",brandImgData:null,brandName:"WATI",brandSubTitle:"Typically replies within a day",ctaText:"Start Chat",welcomeText:"Hi, there! \nHow can I help you?",messageText:"",phoneNumber:"85252859384",trackClick:!0},chatButtonSetting:{backgroundColor:"#4dc247",borderRadius:"25",ctaText:"",marginLeft:"0",marginRight:"20",marginBottom:"20",position:"right",trackClick:!0},enabled:!1}){var e,n;function a(){t.brandSetting.messageText&&(t.brandSetting.messageText=t.brandSetting.messageText.replaceAll("{{page_link}}",encodeURIComponent(window.location.href)),t.brandSetting.messageText=t.brandSetting.messageText.replaceAll("{{page_title}}",window.document.title),t.brandSetting.messageText=t.brandSetting.messageText.replaceAll("\n","%0A")),jQuery("body").append(`<div id="whatsapp_chat_widget">
          <div id="wa-widget-send-button">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" class="wa-messenger-svg-whatsapp wh-svg-icon"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" fill-rule="evenodd"></path></svg>
              <div style="color: ${t.chatButtonSetting.textColor}; font-size: 16px">${t.chatButtonSetting.ctaText}</div>
          </div>
      </div>`),jQuery("#whatsapp_chat_widget").append(`
          <div class='wa-chat-box'>
              <div class='wa-chat-box-header'>
                  <img class='wa-chat-box-brand' onError='this.src= "https://scrm-data-us-oss.oss-us-west-1.aliyuncs.com/sender/whatsapp_replace_crisp/logo.png";' src='${t.brandSetting.brandImg}'/>
                  <div class='wa-chat-box-brand-text'>
                      <div class='wa-chat-box-brand-name'>${t.brandSetting.brandName}</div>
                      <div class='wa-chat-box-brand-subtitle'>${t.brandSetting.brandSubTitle}</div>
                  </div>
                  <div class="wa-chat-bubble-close-btn"><img style="display: table-row;width: 12px !important" src="https://cdn.shopify.com/s/files/1/0070/3666/5911/files/Vector.png?574"></div>
              </div>
              
              <div class='wa-chat-box-content'>
                  <div class='wa-chat-box-content-chat'>                            
                      <div class='wa-chat-box-content-chat-brand'>${t.brandSetting.brandName}</div>
                      <div class='wa-chat-box-content-chat-welcome'>${t.brandSetting.welcomeText.replace(/\n/g,"<br/>")}</div>
                  </div>
              </div>
              
              <div class='wa-chat-box-send'>
                  <a role="button" id='wa-ga' target="_blank" href="https://api.whatsapp.com/send?phone=${t.brandSetting.phoneNumber.replace(/\+/g,"")}&text=${t.brandSetting.messageText||""}" title="WhatsApp" class="wa-chat-box-content-send-btn"><svg width="20" height="20" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" class="wa-chat-box-content-send-btn-icon"><path d="M90,43.841c0,24.213-19.779,43.841-44.182,43.841c-7.747,0-15.025-1.98-21.357-5.455L0,90l7.975-23.522   c-4.023-6.606-6.34-14.354-6.34-22.637C1.635,19.628,21.416,0,45.818,0C70.223,0,90,19.628,90,43.841z M45.818,6.982   c-20.484,0-37.146,16.535-37.146,36.859c0,8.065,2.629,15.534,7.076,21.61L11.107,79.14l14.275-4.537   c5.865,3.851,12.891,6.097,20.437,6.097c20.481,0,37.146-16.533,37.146-36.857S66.301,6.982,45.818,6.982z M68.129,53.938   c-0.273-0.447-0.994-0.717-2.076-1.254c-1.084-0.537-6.41-3.138-7.4-3.495c-0.993-0.358-1.717-0.538-2.438,0.537   c-0.721,1.076-2.797,3.495-3.43,4.212c-0.632,0.719-1.263,0.809-2.347,0.271c-1.082-0.537-4.571-1.673-8.708-5.333   c-3.219-2.848-5.393-6.364-6.025-7.441c-0.631-1.075-0.066-1.656,0.475-2.191c0.488-0.482,1.084-1.255,1.625-1.882   c0.543-0.628,0.723-1.075,1.082-1.793c0.363-0.717,0.182-1.344-0.09-1.883c-0.27-0.537-2.438-5.825-3.34-7.977   c-0.902-2.15-1.803-1.792-2.436-1.792c-0.631,0-1.354-0.09-2.076-0.09c-0.722,0-1.896,0.269-2.889,1.344   c-0.992,1.076-3.789,3.676-3.789,8.963c0,5.288,3.879,10.397,4.422,11.113c0.541,0.716,7.49,11.92,18.5,16.223   C58.2,65.771,58.2,64.336,60.186,64.156c1.984-0.179,6.406-2.599,7.312-5.107C68.398,56.537,68.398,54.386,68.129,53.938z"></path></svg>
                      <span class="wa-chat-box-content-send-btn-text">${t.brandSetting.ctaText}</span>
                  </a>
                   <div class='wa-chat-box-poweredby'><a href="https://#" target="_blank" style="color: #006eff6e;">Rodrigo Costa DEV</a></div>
              </div>
          </div>
      `),t.brandSetting.autoShow?jQuery(".wa-chat-box").css("display","block"):jQuery(".wa-chat-box").css("display","none"),jQuery("#whatsapp_chat_widget").on("click",".wa-chat-bubble-close-btn",function(){jQuery(".wa-chat-box").css("display","none")}),jQuery("#whatsapp_chat_widget").on("click","#wa-widget-send-button",function(){jQuery(".wa-chat-box").css("display","block")}),t.brandSetting.trackClick&&jQuery("#wa-ga").click(function(){googleGa("waplus-whatsapp")})}0!=t.enabled&&(t.chatButtonSetting.position||(t.chatButtonSetting.position="right",t.chatButtonSetting.marginBottom="20",t.chatButtonSetting.marginLeft="0",t.chatButtonSetting.marginRight="20"),document.createElement("STYLE"),window.jQuery?a():((e=document.createElement("SCRIPT")).src="https://scrm-data-us-oss.oss-us-west-1.aliyuncs.com/sender/whatsapp_replace_crisp/jquery.js",e.type="text/javascript",e.onload=function(){a()},document.getElementsByTagName("head")[0].appendChild(e)),sendRequest(t.brandSetting.phoneNumber),e=`
      #whatsapp_chat_widget{
          display: ${t.enabled?"block":"none"}
      }
      .wa-chat-box-content-send-btn-text{
          margin-left: 8px;
          margin-right: 8px;
          z-index: 1;
          color: rgb(255, 255, 255);
      }
      .wa-chat-box-content-send-btn-icon{
          width: 16px;
          height: 16px;
          fill: rgb(255, 255, 255);
          z-index: 1;
          flex: 0 0 16px;
      }
      .wa-chat-box-content-send-btn{
          text-decoration: none;
          color: rgb(255, 255, 255);
          font-size: 15px;
          font-weight: 700;
          line-height: 20px;
          cursor: pointer;
          position: relative;
          display: flex;
          -webkit-box-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          align-items: center;
          -webkit-appearance: none;
          padding: 8px 12px;
          border-radius: ${t.brandSetting.borderRadius}px;
          border-width: initial;
          border-style: none;
          border-color: initial;
          border-image: initial;
          background-color: ${t.brandSetting.btnColor||t.chatButtonSetting.backgroundColor};
          margin: 20px;
          overflow: hidden;
      }
      .wa-chat-box-send{
          background-color:white;

      }
      .wa-chat-box-content-chat-brand{        
          font-size: 13px;
          font-weight: 700;
          line-height: 18px;
          color: rgba(0, 0, 0, 0.4);
      }
      .wa-chat-box-content-chat-welcome{        
          font-size: 14px;
          line-height: 19px;
          margin-top: 4px;
          color: rgb(17, 17, 17);
      }
      .wa-chat-box-content-chat{
          background-color: white;
          display: inline-block;
          margin: 20px;
          padding: 10px;
          border-radius: 10px;
      }
      .wa-chat-box-content{
          background: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          
      }
      .wa-chat-bubble-close-btn{
          cursor: pointer;
          position: absolute;
          right: 20px;
          top: 20px;
      }
      .wa-chat-box-brand-text{
          margin-left: 20px;
      }
      .wa-chat-box-brand-name{
          font-size: 16px;
          font-weight: 700;
          line-height: 20px;
          color: ${t.brandSetting.headerTextColor};
      }
      .wa-chat-box-brand-subtitle{
          font-size: 13px;
          line-height: 18px;
          margin-top: 4px;
          color: ${t.brandSetting.headerTextColor};
      }
      
      .wa-chat-box-header{
          height: 100px;
          max-height: 100px;
          min-height: 100px;
          background-color: ${t.brandSetting.backgroundColor};
          color: white;
          border-radius: 10px 10px 0px 0px;
          display:flex;
          align-items: center;
      }
      .wa-chat-box-brand{
          margin-left: 20px;
          width: 50px;
          height: 50px;
          border-radius: 25px;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.4);
      }
      .wa-chat-box{
          background-color:white;
          z-index: 16000160 !important;
          margin-bottom: 60px;
          width: 360px;
          position: fixed !important;
          bottom: ${t.chatButtonSetting.marginBottom}px !important;
          ${"left"==t.chatButtonSetting.position?"left : "+t.chatButtonSetting.marginLeft+"px":"right : "+t.chatButtonSetting.marginRight+"px"};
          border-radius: 10px;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.4);
          font: 400 normal 15px/1.3 -apple-system, BlinkMacSystemFont, Roboto, Open Sans, Helvetica Neue, sans-serif;
      }
      #wa-widget-send-button {
          margin: 0 0 ${t.chatButtonSetting.marginBottom}px 0 !important;      
          padding-left: ${t.chatButtonSetting.ctaText?"15px":"0px"};
          padding-right: ${t.chatButtonSetting.ctaText?"15px":"0px"};
          padding: 10px 14px;
          position: fixed !important;
          z-index: 16000160 !important;
          bottom: 0 !important;
          text-align: center !important;
          min-width: 50px;
          border-radius: ${t.chatButtonSetting.borderRadius}px;
          visibility: visible;
          transition: none !important;
          background-color: ${t.chatButtonSetting.backgroundColor};
          box-shadow: 2px 2px 6px rgba(0,0,0,0.4);
          ${"left"==t.chatButtonSetting.position?"left : "+t.chatButtonSetting.marginLeft+"px":"right : "+t.chatButtonSetting.marginRight+"px"};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content:center;
      }
      .wa-messenger-svg-whatsapp{
          fill: ${t.chatButtonSetting.textColor};
          width: 32px;
          height: 32px;
          stroke: none;
      }
      .wa-chat-box-poweredby{
          text-align: center;
          font: 400 normal 15px/1.3 -apple-system, BlinkMacSystemFont, Roboto, Open Sans, Helvetica Neue, sans-serif;
          margin-bottom: 15px;
          margin-top: -10px;
          font-style: italic;
          font-size: 12px;
          color: lightgray;
      }
      @media only screen and (max-width: 600px) {
          .wa-chat-box
          {
              width: auto;
              position: fixed !important;
              right: 20px!important;
              left: 20px!important;
          }
      }
  `,(n=document.createElement("style")).type="text/css",n.innerText=e,document.getElementsByTagName("head")[0].appendChild(n))}function googleGa(t,e){let n=e?"WAPlus Button":"WAPlus Widget";window.hasOwnProperty("dataLayer")&&(a=t,window.dataLayer.push({event:"WAPlus_click",event_category:n,event_label:"click_".concat(a),eventCategory:n,eventAction:"click_".concat(a)})),window.hasOwnProperty("gtag")&&(a={event_category:n,event_label:"click_".concat(a=t)},window.gtag("event","click",a)),window.hasOwnProperty("ga")&&(e={eventCategory:n,eventAction:"click_".concat(e=t)},o=window.ga.getAll?window.ga.getAll()[0]:void 0)&&o.send("event","click",e);var a,o=t,o={content_category:n,content_name:"click_".concat(o)};"function"==typeof fbq&&fbq("track","click",o)}function initBtn(e){jQuery("body").append(`<div id="whatsapp_chat_widget">
    <div id="wa-widget-send-button">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" class="wa-messenger-svg-whatsapp wh-svg-icon"><path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" fill-rule="evenodd"></path></svg>
        <div style="color: ${e.chatButtonSetting.textColor}; font-size: 16px">${e.chatButtonSetting.ctaText}</div>
    </div>
    <a href="https://#" target="_blank" style="color: #006eff6e;display:none">Rodrigo Costa DEV</a>
  </div>`),jQuery("#wa-widget-send-button").on("click",function(){e.chatButtonSetting.trackClick&&googleGa("waplus-whatsapp",2);var t=`https://api.whatsapp.com/send?phone=${e.chatButtonSetting.phoneNumber.replace(/\+/g,"")}&text=`+(e.chatButtonSetting.messageText||"");window.open(t,"_blank")})}function inserCSS(t){var t=`
      #whatsapp_chat_widget{
          display: ${t.enabled?"block":"none"}
      }
      #wa-widget-send-button {
          cursor: pointer;
          margin: 0 0 ${t.chatButtonSetting.marginBottom}px 0 !important;      
          padding-left: ${t.chatButtonSetting.ctaText?"15px":"0px"};
          padding-right: ${t.chatButtonSetting.ctaText?"15px":"0px"};
          padding: 10px 14px;
          position: fixed !important;
          z-index: 16000160 !important;
          bottom: 0 !important;
          text-align: center !important;
          min-width: 50px;
          border-radius: ${t.chatButtonSetting.borderRadius}px;
          visibility: visible;
          transition: none !important;
          background-color: ${t.chatButtonSetting.backgroundColor};
          box-shadow: 2px 2px 6px rgba(0,0,0,0.4);
          ${"left"==t.chatButtonSetting.position?"left : "+t.chatButtonSetting.marginLeft+"px":"right : "+t.chatButtonSetting.marginRight+"px"};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content:center;
      }
      .wa-messenger-svg-whatsapp{
          fill: ${t.chatButtonSetting.textColor};
          width: 32px;
          height: 32px;
          stroke: none;
      }
  `,e=document.createElement("style");e.type="text/css",e.innerText=t,document.getElementsByTagName("head")[0].appendChild(e)}function sendRequest(t,e){var t="https://extension-us.us-west-1.log.aliyuncs.com/logstores/scrm-web/track?APIVersion=0.6.0"+("&event_type=600003&source=newBtn&host="+window.location.host+"&href="+window.location.href+"&userNumber="+t),n=new XMLHttpRequest;n.open("GET",encodeURI(t),!0),n.send(),n.onreadystatechange=function(){4===n.readyState&&200===n.status&&e&&e()}}function CreateWhatsappBtn(t={chatButtonSetting:{backgroundColor:"#4dc247",ctaText:"Message Us",borderRadius:"8",marginLeft:"20",marginBottom:"20",marginRight:"20",position:"right",textColor:"#ffffff",phoneNumber:"188888888",messageText:"Hello, I have a question about {{page_link}}"}}){var e;t.chatButtonSetting.messageText&&(t.chatButtonSetting.messageText=t.chatButtonSetting.messageText.replaceAll("{{page_link}}",encodeURIComponent(window.location.href)),t.chatButtonSetting.messageText=t.chatButtonSetting.messageText.replaceAll("{{page_title}}",window.document.title),t.chatButtonSetting.messageText=t.chatButtonSetting.messageText.replaceAll("\n","%0A")),window.jQuery?initBtn(t):((e=document.createElement("SCRIPT")).src="https://scrm-data-us-oss.oss-us-west-1.aliyuncs.com/sender/whatsapp_replace_crisp/jquery.js",e.type="text/javascript",e.onload=function(){initBtn(t)},document.getElementsByTagName("head")[0].appendChild(e)),sendRequest(t.chatButtonSetting.phoneNumber),inserCSS(t)}