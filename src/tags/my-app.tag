import '../scripts/tags/rg-alerts/rg-alerts.tag';

<my-app>
 
  <rg-alerts></rg-alerts>
  <div if={start} class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Shop Details</div>
    <div class="c-card__item">
      <p "c-paragraph">Please enter the details of the shop: </p>

      <div class ="inps"> 
        <div class = "elmts">
          <label for="siteName" class="grps">Site Name : </label>
          <input type="text" name="siteName" maxlength="255" class="c-field grps" style = "width: 65%;display:inline-block;">
        </div>
        <div class= "elmts">
          <label class="grps" for="languageSelect">Default Shop Language:</label>
          <div class ="grps">
          <select name="languageSelect" onchange={ update } class="c-field " style = "width: 65%; display:inline-block; margin:2px">
              <option selected></option>
              <option value="de">de</option>
              <option value="nl">nl</option>
              <option value="en">en</option>
              <option value="it">it</option>
              <option value="es">es</option>
              <option value="fr">fr</option>
              <option value="custom">custom</option>
          </select>
          <input type="text" name="customLang" maxlength="2" onchange={ update } if={ languageSelect.value == 'custom' } class="c-field" style = "width: 30%;display:inline-block;">
          </div>
        </div>
        
      </div>
      <br>

      <div class = "seperator"/>
      <br>
      <button onclick={ next } class="c-button c-button--success" type="button " style = "margin:auto; display:block;">Continue to Product Feed Configuration</button>
    </div>
  </div>

  <div if={configure} class="c-card u-highest" class="u-center-block" style = "width: 90%; height: 40%; margin: auto">
    <div class="c-card__item" align = "center">
      <br>
      <button onclick = {pro} class="c-button c-button--success" if = {!this.opts.state.categories} >Add Product Feed Configuration</button>
      <button onclick = {cat} class="c-button c-button--success" if = {this.opts.state.categories}>Add Category Feed Configuration</button>
      <br><br>
      <div class = "seperator"/>
      <br>  
      <div align = "center">
        <button onclick={ goback } class="c-button" type="button">Go Back</button> 
      </div>
      <br>  
    </div>
  </div>
  
  <script>
   
    this.on("mount", function() 
    {
      this.defaultLanguage = this.opts.data.deflang
      this.start = this.opts.state.start
      this.configure = this.opts.state.configure
      if(this.opts.data.siteName)
        this.siteName.value = this.opts.data.siteName
      if(this.defaultLanguage !== '')
        this.languageSelect.value = this.defaultLanguage
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
  
    addKeys(e) 
    {
      if (this.siteKey.value) 
      {
        if(this.siteKeys.indexOf(this.siteKey.value) == -1)
          this.siteKeys.push(this.siteKey.value)
        else
          this.alerter("already added", 'error')
      }
    }

    removeKeys(e)
    {
      this.siteKeys.splice(this.siteKeys.indexOf(e.item.key), 1)
    }

    next()
    {
      if(this.languageSelect.value && this.siteName.value)
      {
        if(this.languageSelect.value == 'custom')
        {
          if(this.customLang.value.length == 2)
          {
            this.defaultLanguage = this.customLang.value
          } 
          else
          {
            
            this.alerter("language code must have exactly two charachters", "error")
            return void 0
          } 
        }
        else
          this.defaultLanguage = this.languageSelect.value
        this.start = false
        this.configure = true
        this.update()
        // this.pro()        
      }
      else
      {
        if(!this.languageSelect.value)
        {
          this.alerter("You have to select the default language", "error")
        }
        else
        {
          this.alerter("You have to enter the siteName", "error")
         
        }
      }
    }

    pro()
    {
        this.opts.resolver({siteName: this.siteName.value, defaultLanguage: this.defaultLanguage}, this.opts.path,this.opts.path+"/pro")
        this.unmount()
    }

    cat()
    {
        this.opts.resolver({siteKeys: this.siteKeys, defaultLanguage: this.defaultLanguage}, this.opts.path, this.opts.path+"/cat")
        this.unmount()
    }
  
    goback()
    {
      this.start = true
      this.configure = false
      this.update()
    }

  </script>

</my-app>
