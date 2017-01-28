<my-choice>

    <div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
        <div class="c-card__item c-card__item--brand" align = "center">Configure Other Properties</div>
        <div class="c-card__item">
            <div if={ !this.opts.state.root }>
                <label class="block-label" for="skuColumn">SKU Column :</label>
                <select name = "skuColumn" onchange = {update} class="c-field" style = "width: 20%; display:inline-block;">
                    <option selected></option>
                    <option each={column in this.header} value={column} no-reorder>{column}</option>
                </select>
            </div>

            <br if={ !this.opts.state.root }>

            <div class="o-grid o-grid--wrap" style="height:300px">
                <div class="o-grid__cell o-grid__cell--width-33" if ={this.opts.state.root}>
                    <button class="c-button c-button--info butt" type="button" name = "pr" onclick = {process}  >Reconfigure Primary Mappings</button>
                </div>
                <div class="o-grid__cell o-grid__cell--width-33">
                    <button class="c-button c-button--info butt" type="button" name = "my-secondary" id = "secondaryMappings2" onclick = {process}>Secondary Mapping</button>
                </div>
                <div class="o-grid__cell o-grid__cell--width-33">
                    <button class="c-button c-button--info butt" type="button" name = "my-property" id = "propertyGroups2" onclick = {process}>Property Group</button> 
                </div>
                <div class="o-grid__cell o-grid__cell--width-33">
                    <button class="c-button c-button--info butt" type="button" name = "my-group" id = "groupMappings" onclick = {process}>Group Mapping</button>
                </div>
                <div class="o-grid__cell o-grid__cell--width-33">
                    <button class="c-button c-button--info butt" type="button" name = "my-cm" id = "categoryMapping" onclick = {process}>Category Mapping</button>
                </div>
                <div class="o-grid__cell o-grid__cell--width-33" if ={this.opts.state.root}>
                    <button class="c-button c-button--info butt" type="button"name = "my-processor" id = "postProcessors" onclick = {process} >Post Processor</button>
                </div>
            </div>

            
            
            <br>
                <div class = "seperator"/>
            <br>

            <div align="center">
                <button class="c-button c-button--success" type="button" onclick = {done}>Done</button>
            </div>

        </div>
    </div>


    <script>
        this.on("mount", function()
        {   
            if(!this.opts.state.root)
                this.header = this.opts.data.header
            this.update()
            if(this.opts.data.sku)
                this.skuColumn.value = this.opts.data.sku
            this.update()
        })
        process(e)
        {
            if(!this.opts.state.root && !this.skuColumn.value)
            {
                alert("Please selecta valid column for SKU")
                return void 0
            }
            if(e.target.name === "pr")
            {
                this.opts.resolver(void  0, this.opts.path, "begin/pro/type/upload_parse")
                this.unmount()
            }
            else
            {
                this.opts.resolver({type: e.target.name, obj : e.target.id, sku: this.skuColumn.value }, this.opts.path, this.opts.path+"/choice")
                this.unmount()
            }
        }
        done()
        {
            if(this.opts.state.root)
                this.opts.resolver(void 0, this.opts.path, "begin")
            else
                this.opts.resolver(void 0, this.opts.path, "begin/pro/type/upload_parse/primaryMap/preview/choice")
            this.unmount()
        }
    </script>

    <style>

    .butt
    {
        width:95%;
        white-space: normal;
        word-wrap: break-word;
        height: 95%;
    }

    </style>

</my-choice>