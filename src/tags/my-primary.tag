import primaryMap from '../scripts/pc_md.js';
import _ from 'underscore';
import './my-fields.tag';
import '../scripts/tags/rg-alerts/rg-alerts.tag';
import '../scripts/tags/rg-modal/rg-modal.tag';

<my-primary>
    <rg-alerts></rg-alerts>
    <div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
        <div class="c-card__item c-card__item--brand" align = "center">Configure Primary Mappings</div>
        <div class="c-card__item">      
            <virtual each = {element in map.fields} no-reorder>
                <br>
            	<my-fields label= {element} mappingkind = {"primaryMappings2"} langs = {this.langs} header = {this.header} senddata = {this.recieveData}></my-fields>
                <br>
                <div class = "seperator"/>
            </virtual>

            <br>
            <div align = "center">
                <button onclick = { next } class="c-button c-button--success" type="button">Save and continue</button>&nbsp;<button onclick = { previous } class="c-button c-button--error" type="button">Go Back</button> 
            </div>
            <br>
        </div>
    </div>
    <rg-modal if = {alert}></rg-modal>

    <script>
    
        var tag = this
            
        this.on("before-mount", function() 
        {
            this.alert = false
            this.map = primaryMap
            this.langs = this.opts.data.langs
            this.header = this.opts.data.header
            this.primaryMappings2 = {}
            // To do: add support refill form when returning from preview to reconfigure
            this.update()
        })
      
        this.recieveData = function(data, type)
        {
            tag.primaryMappings2[type] = data
        }

        next()
        {
            if(!this.validate())
                return void 0
            this.opts.resolver(this.primaryMappings2, this.opts.path, this.opts.path+"/primaryMap")
            this.unmount()
        }

        alerter(message, type)
        {
            riot.mount('rg-alerts', 
            {
                alerts:[{
                type: type,
                text: message,
                timeout: 3000
                }]
            })
        }
              
        previous()
        {
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

        validate()
        {
            for(var val in this.primaryMappings2)
            {
                if(this.primaryMappings2[val])
                {
                    if(!this.primaryMappings2[val].ValueType)
                    {
                        this.alerter("All fields under "+ val +" are required", "error")
                        return false
                    }
                    else
                    {
                        if(this.primaryMappings2[val].Regex === "")
                        {
                           this.alerter("A valid value for Regex under "+ val + " is required", "error")
                           return false
                        }
                        if(this.primaryMappings2[val].Prefix === "")
                        {
                            this.alerter("A valid value for Prefix under "+ val + " is required", "error")
                            return false
                        }
                    }
                }
            }
            return true
        }

    </script>
</my-primary>