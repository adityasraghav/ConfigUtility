import primaryMap from '../scripts/pc_md.js';

<my-preview>

    <div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Preview</div>
    <div class="c-card__item">
        <div name = "lang">
        	<label for="languageSelect">Languages</label>
            <select name="languageSelect" class = "c-field" onchange={ check } style = "width: auto; display:inline-block;">
            	<option each={lang in this.opts.data.langs} value = {lang} }>{lang}</option>
            </select>
        </div>
        <br>

        <div class="o-grid  o-grid--wrap">
            <div each = {pro in products} class="o-grid__cell o-grid__cell--width-33 ">
                
                <div name="proImg" if = {pro.imageURL}>
                	<img src = {pro.imageURL} style="width:75%; height:75%;"></img>
                </div>
                <div name="proID">
                    Article ID = {pro.id}
                </div>
                <div name="proLbl" if = {pro.label}>
                	Label = {pro.label}
                </div>
                <div name="price" if = {pro.price}>
                	Price = {pro.price}
                </div>
                <br>
            </div>
        </div>

        <br>
        <div class = "seperator"/>
        <br>
        
        <div align = "center">
            <button onclick = { next } class="c-button c-button--success" type="button">Accept</button>
            <button onclick = { back } class="c-button c-button--error" type="button">Reconfigure</button>
        </div>
    </div>
    </div>

<script>

    this.products = []

    this.on("mount", function() 
    { 
        this.pm = primaryMap.fields
        this.products = []
        this.primaryMappings2 = this.opts.data.primaryMappings2
        this.check()
        this.update()
    })

    check()
    {
	   this.language = this.languageSelect.value;
	   this.process()
    }

    process()
    {
    	var map = {}

        for (var val in this.pm)
        {
            var xvar = this.pm[val].name
            if(this.primaryMappings2[xvar])
                map[xvar+"Col"] = this.primaryMappings2[xvar].LanguageParameterNames[this.language]
        }
    	
        var product = []
    	var thiz =  this

    	this.opts.data.SampleValues.forEach(function(prod) 
    	{
        	var temp = {}
            for (var val in thiz.pm)
            {
                var xvar = thiz.pm[val].name
                
                if(thiz.primaryMappings2[xvar])
                {
                    if(thiz.primaryMappings2[xvar].Regex || thiz.primaryMappings2[xvar].Prefix)
                    {
                        if(thiz.primaryMappings2[xvar].Regex)
                        {
                            var reg = new RegExp(thiz.primaryMappings2[xvar].Regex)
                            var Xvar =  prod[map[xvar+"Col"]].exec(reg)
                            temp[xvar] = Xvar
                        }
                        if(thiz.primaryMappings2[xvar].Prefix)
                        {                         
                            var Xvar =  thiz.primaryMappings2[xvar].Prefix + prod[map[xvar+"Col"]]
                            temp[xvar] = Xvar
                        }
                    }
                    else
                        temp[xvar] = prod[map[xvar+"Col"]]
                }     
            }
       	 	
            product.push(temp)
    	});
    	this.products = product
    }

    back()
    {
    	this.opts.resolver(void 0, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
        this.unmount()
    }
    next()
    {
        this.opts.resolver(this.products, this.opts.path, this.opts.path+"/preview")
        this.unmount()
    }

    </script>

</my-preview>