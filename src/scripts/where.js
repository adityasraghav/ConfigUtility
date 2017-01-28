import riot from 'riot'
import _ from 'underscore';

export default 
{

  where : {

    objectify: function(header, sample)
    {
      var SampleValues = []
      var len = sample.length
      var hlen = header.length
      for(var i=0;i<len;i++)
      {
        var item = {}
        for(var j=0;j<hlen;j++)
          item[header[j]] = sample[i][j]
        SampleValues.push(item)
      }
      return SampleValues
    },

    analyze: function(data, pathin, pathout)
    {
      var state = {}
      var r_data = {}
      var tag = ""
      
      if(pathout === "begin/pro" && pathin === "begin")
      {
        _.extend(this.config, data)
        if(!this.config.ProductFeeds)
          this.config.ProductFeeds = []
        this.temppro = {}
        
        tag  = "my-type"
        state = {} 
        r_data = {languages: []}
      }

      else if(pathout === "begin" && pathin === "begin/pro")
      {
        tag  = "my-app"
        state = {start: true, configure: false} 
        r_data = {deflang: this.config.defaultLanguage, siteName: this.config.siteName}
      }

      else if(pathout === "begin/pro/type" && pathin === "begin/pro")
      {
        _.extend(this.temppro, data.info)
        this.tempdata.rootLangs = data.lan
        tag  = "my-sample-upload"
        state = {rawData: void 0, complete: false} 
        r_data = {parser: "csv"}
      }

      else if(pathout === "begin/pro" && pathin === "begin/pro/type")
      {
        tag  = "my-type"
        state = {} 
        r_data = {values:this.temppro , languages: this.tempdata.rootLangs}
        this.temppro = {}
      }

      else if(pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type")
      {
        this.temppro.csvDelimter = data.del
        this.temppro.csvQuote =  data.qual
        this.tempdata.result = data.result
        tag  = "my-primary"
        state = {} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header}
      }

      else if(pathout === "begin/pro/type" && pathin === "begin/pro/type/upload_parse")
      {
        tag  = "my-sample-upload"
        state = {rawData: void 0, complete: false} 
        r_data = {parser: "csv"}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap" && pathin === "begin/pro/type/upload_parse")
      {
        this.temppro.primaryMappings2 = data

        tag  = "my-preview"
        state = {} 
        r_data = {langs: this.tempdata.rootLangs, primaryMappings2: data, SampleValues : this.objectify(this.tempdata.result.header, this.tempdata.result.sample)}
      }

      else if(pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap")
      {
        tag  = "my-primary"
        state = {} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview" && pathin === "begin/pro/type/upload_parse/primaryMap")
      {
        this.tempdata.processed = data 
        tag  = "my-choice"
        state = {root:true} 
        r_data = {}
      }

      else if(pathout === "begin" && pathin === "begin/pro/type/upload_parse/primaryMap/preview")
      {
        this.config.ProductFeeds.push(this.temppro)
        this.tempdata = {}
        this.rootLangs = []

        if(!this.temppro.categoryMapping || this.temppro.categoryMapping.Type=="discrete")
        {
          tag  = "my-app"
          state = {start: false, configure: true, categories:true} 
          r_data = {deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys}
        }
        else
        {
          tag  = "my-app"
          state = {start: false, configure: true, categories:false} 
          r_data = {deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys}
        }
      }

      else if(pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview")
      {
        tag  = "my-primary"
        state = {} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview")
      {

        if((data.obj === "propertyGroups2" || data.obj === "secondaryMappings2" || data.obj === "postProcessors")  && !this.temppro[data.obj])
        {
          this.temppro[data.obj] = []
          if(!this.tempdata.tempnames)
            this.tempdata.tempnames = []
        }
        else
        {
          if(!this.temppro[data.obj])
            this.temppro[data.obj] = {}
        }

        tag  = data.type
        state = {init: this.temppro[data.obj], names: this.tempdata.tempnames} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header, sample: this.objectify(this.tempdata.result.header, this.tempdata.result.sample), ids : this.tempdata.processed}
      }
      
      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice")
      {

        this.temppro[data.type] = data.data

        tag  = "my-choice"
        state = {root:true} 
        r_data = {}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice")
      {
        this.tempdata.tempnames = data.tempnames
        this.temppost = {}
        this.temppost.type = data.type
        this.temppost.options = {}

        tag  = "my-type"
        state = {} 
        r_data = {languages: []}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor")
      {
        _.extend(this.temppost.options, data.info)
        this.tempdata.subLangs = data.lan
        tag  = "my-sample-upload"
        state = {rawData: void 0, complete: false} 
        r_data = {parser: "csv"}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type")
      {
        this.temppost.options.csvDelimter = data.del
        this.temppost.options.csvQuote =  data.qual
        this.tempdata.subresult = data.result
        tag  = "my-choice"
        state = {root: false} 
        r_data = {header : data.result.header }
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor")
      {
        tag  = "my-processor"
        state = {init: this.temppro.postProcessors} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type")
      {
        tag  = "my-type"
        state = {} 
        r_data = {values:this.temppost , languages: this.tempdata.subLangs}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse")
      {
        this.temppro.postProcessors.push(this.temppost)
        tag  = "my-processor"
        state = {init: this.temppro.postProcessors, names:this.tempdata.tempnames} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse")
      {
        this.temppost.options.skuColumn = data.sku
        if((data.obj === "propertyGroups2" || data.obj === "secondaryMappings2")  && !this.temppost.options[data.obj])
        {
          this.temppost.options[data.obj] = []
        }
        else
        {
          if(!this.temppost.options[data.obj])
            this.temppost.options[data.obj] = {}
        }
        tag  = data.type
        state = {init: this.temppost.options[data.obj]}
       
        var fake = {}
        for (var i = this.tempdata.subLangs.length - 1; i >= 0; i--) {
          fake[this.tempdata.subLangs[i]] = this.temppost.options.skuColumn
        }
        
        r_data = {langs: this.tempdata.subLangs, header: this.tempdata.subresult.header,  sample: this.objectify(this.tempdata.subresult.header, this.tempdata.subresult.sample), ids : fake}
      }

      else if(pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse/choice")
      {
        this.temppost.options[data.type] = data.data
        tag  = "my-choice"
        state = {root: false} 
        r_data = {header : this.tempdata.subresult.header, sku: this.temppost.options.skuColumn}
      }

      // Category Feeds _________________________________________________________________________________________________________________________________

      else if(pathout === "begin/cat" && pathin === "begin")
      {
        _.extend(this.config, data)
        if(!this.config.categoryFeeds)
          this.config.categoryFeeds = []
        this.tempcat = {}

        tag  = "my-type"
        state = {} 
        r_data = {languages: []}
      }

      else if(pathout === "begin" && pathin === "begin/cat")
      {
        tag  = "my-app"
        state = {start: false, configure: true} 
        r_data = {deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys}
      }

      else if(pathout === "begin/cat/type" && pathin === "begin/cat")
      {
        _.extend(this.tempcat, data.info)
        this.tempdata.rootLangs = data.lan

        tag  = "my-sample-upload"
        state = {rawData: void 0, complete: true} 
        r_data = {parser: "csv"}
      }

      else if(pathout === "begin/cat" && pathin === "begin/cat/type")
      {
        tag  = "my-type"
        state = {} 
        r_data = {values:this.tempcat , languages: this.tempdata.rootLangs}
      }

      else if(pathout === "begin/cat/type/upload_parse" && pathin === "begin/cat/type")
      {
        this.tempcat.csvDelimter = data.del
        this.tempcat.csvQuote =  data.qual
        this.tempdata.result = data.result

        tag  = "my-rest"
        state = {} 
        r_data = {langs: this.tempdata.rootLangs, header: this.tempdata.result.header, SampleValues : this.objectify(this.tempdata.result.header, this.tempdata.result.sample)}
      }
      
      else if(pathout === "begin" && pathin === "begin/cat/type/upload_parse")
      {
        _.extend(this.tempcat, data)
        this.config.categoryFeeds.push(this.tempcat)
        this.tempdata = {}
        this.rootLangs = []

        tag  = "my-app"
        state = {start: false, configure: true, categories: falser} 
        r_data = {deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys}       
      }

      return {tag:tag, path:pathout, state:state, data:r_data}
    },

    config: {},
    tempdata: {},

  }
};