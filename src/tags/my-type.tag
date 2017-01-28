import '../scripts/tags/rg-alerts/rg-alerts.tag';
import '../scripts/tags/rg-modal/rg-modal.tag';
<my-type>
  
  <rg-alerts></rg-alerts>
  <div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Feed Details</div>
    <div class="c-card__item">
      <div class = "inps">
        <div class = "elmts">
          <label for="languageSelect" class = "grps">Site Languages:</label>
          <div class="grps" style = "width=60%">
            <select name="languageSelect" onchange={add} class = "c-field" style = "display:inline-block; width:auto">
              <option selected></option>
              <option value="de">de</option>
              <option value="nl">nl</option>
              <option value="en">en</option>
              <option value="it">it</option>
              <option value="es">es</option>
              <option value="fr">fr</option>
              <option value="custom">custom</option>
            </select>
            <input type="text" name="customLang" maxlength="2" onchange={ updateLanguages } if={ languageSelect.value == 'custom' } class="c-field" style = "display:inline-block; width:100px">
            <button onclick={ add } type = "button" class = "c-button c-button--info" if={ languageSelect.value == 'custom' } style = "display:inline-block; width:auto;">ADD</button>
          </div>
        </div>
            
      <div class = "elmts" each={ lang in languages }>
        <label class = "grps">&nbsp;&#8226;&nbsp;{ lang }&nbsp;&nbsp;</label>
        <button onclick={ parent.remove } class="c-button c-button--error grps" type="button">Remove</button>
      </div>

      <br>

        <div class = "elmts">
        	<label for="checkInteval" class = "grps" >Check Interval : </label>
        	<input type="number" name="checkInterval" placeholder="Feed Refresh Interval (in minutes)" min="10"  class="c-field grps" >
      	</div>	
        <div class = "elmts" >
      	<label for="dwnld"  class = "grps">Download URL : </label>
      	<input type="text" name="dwnld" maxlength="255"  class="c-field grps">
      	</div>
        <div class = "elmts">	
      	<label for="username" class = "grps" >Download Username:</label>
      	<input type="text" name="username" maxlength="255"  class="c-field grps" >
      	</div>
        <div class = "elmts">	
      	<label for="password" class = "grps" >Download Password:</label>
      	<input type="password" name="password" maxlength="255"  class="c-field grps" >
        </div>
      
        <div class = "elmts">
          <label for="typeSelect"  class = "grps">Select the file type you wish to upload: &nbsp;</label>
          <select name="typeSelect" onchange={ update } class="c-field grps">
            <option selected value="csv">csv</option>
            <option value="json" disabled>json</option>
            <option value="tsv" disabled>tsv</option>
            <option value="xls" disabled>xls</option>
            <option value="es" disabled>xml</option>
          </select>
        </div>
      </div>
      <br>
      <div class = "seperator"/>
      <br>
      <div align = "center">
        <button onclick = { next } class="c-button c-button--success" type="button">Save and continue</button>&nbsp;<button onclick = { previous } class="c-button c-button--error" type="button">Go Back</button> 
      </div>
    </div>
  </div>

  <rg-modal if = {alert}></rg-modal>
  
  <script>

  this.on("mount", function() 
  {
    this.alert = false
    this.languages = this.opts.data.languages
    if(this.opts.data.values)
    {
      this.checkInterval.value = this.opts.data.values.checkInterval
      this.dwnld.value =  this.opts.data.values.downloadUrl
      this.username.value = this.opts.data.values.downloadUser
      this.password.value = this.opts.data.values.password
      this.typeSelect.value = this.opts.data.values.parserType  
    }
    this.update() 
  })

  alerter(message, type)
  {
    riot.mount('rg-alerts', 
    {
      alerts:[{
        type: type,
        text: message,
        timeout: 3000
        }]
    });
  }

    add(e) 
    {
      this.languageSelect[0].disabled=true;
      this.update()
      if(this.languageSelect.value)
      {  
        if(this.languageSelect.value == 'custom')
        {
          if(this.customLang.value && this.customLang.value.length == 2)
          {
            if(this.languages.indexOf(this.customLang.value) === -1)
              this.languages.push(this.customLang.value)
            else
              this.alerter("already added", "error")
          }
          else if(this.customLang.value && this.customLang.value.length < 2)
          {
            this.alerter("language code must have exactly 2 characters", "error")
          }
        }
        else if (this.languageSelect.value != 'custom') 
        {
          if(this.languages.indexOf(this.languageSelect.value) === -1)
            this.languages.push(this.languageSelect.value)
          else
            this.alerter("already added", "error")
        }
      }
      else
        this.alerter("choose an option", "error")
    }

    remove(e) 
    {
      this.languages.splice(this.languages.indexOf(e.item.lang), 1)
    }

    next()
    {
      if(this.languages.length<1)
      {
        this.alerter("add atleast one language", "error")
        return void 0
      }
      // if(!this.checkInterval.value || parseInt(this.checkInterval.value) <10)
      // {
      //   this.alerter("must enter a valid Check Interval", "error")
      //   return void 0
      // }
      // if(!this.dwnld.value.match(re_weburl))
      // {
      //   this.alerter("must enter a valid URL", "error")
      //   return void 0
      // }
      // if(this.username.value && !this.password.value)
      // {
      //   this.alerter("must enter a valid password", "error")
      //   return void 0
      // }

      this.values = {}
      this.values.checkInterval = parseInt(this.checkInterval.value)
      this.values.downloadUrl = this.dwnld.value
      this.values.downloadUser = this.username.value
      this.values.password = this.password.value
      this.langs = this.languages
      this.values.parserType = this.typeSelect.value  
        
      this.opts.resolver({info: this.values, lan : this.langs},this.opts.path, this.opts.path+"/type")
      this.unmount()
    }
    	
    previous()
    {
      var tag = this
      this.alert = true
      this.update();
      var tags = riot.mount('rg-modal', {
        modal: {
        isvisible: true,
        dismissable: false,
        contents : "<br><h3>All changes made will be lost<h3>",
        buttons: [{
            text: 'Ok',
            type: 'info',
            action: function () 
            {
              tag.opts.resolver(void 0, tag.opts.path, tag.opts.path.slice(0, tag.opts.path.lastIndexOf('/')))
              tag.unmount()
            }
          }, 
          {
            text: 'Cancel',
            type: 'error',
            action: function () 
            {
              tag.alert = false
              tag.update()
            }
          }]
        }
      })
    }

    var re_weburl = new RegExp(
    "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
    // IP address exclusion
    // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
    // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    // TLD may end with dot
    "\\.?" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#]\\S*)?" +
    "$", "i"
    );

  </script>

</my-type>