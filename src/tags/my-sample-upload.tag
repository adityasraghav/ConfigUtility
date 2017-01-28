import '../scripts/tags/rg-alerts/rg-alerts.tag';
import '../scripts/tags/rg-modal/rg-modal.tag';

<my-sample-upload>
  
  <rg-alerts></rg-alerts>
  <div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">File Upload</div>
    <div class="c-card__item">  
      <div class="dropzone" name="dropZone">
        <input type="file" name="fileInput">
      </div>

      <div if= {rawData}>
        <ul class="colss">
          <li>
            <div class="indicator suggest" name="indicator" ></div>
          </li>
          <li>
            <label class="block-label" for="delimSelect">Delimiter:</label>
            <select name="delimSelect" onchange={ updateDelimiter } class="c-field" style = "display:inline-block;">
              <option selected = {resolve}> </option>
              <option value="-1">Custom</option>
              <option value="0">;</option>
              <option value="1">,</option>
              <option value="2">Tab</option>
              <option value="3">|</option>
              <option value="4">Space</option>
            </select>
          </li>
          <li><input type="text" name="customDelim" maxlength="1" onchange={ updateDelimiter } if={ delimSelect.value ==='-1' } class="c-field" style = "width:50px; display:inline-block;"></li>
          <li>
            <span class="block-label">Text qualifier:</span>
            <label class="radio-label"><input type="radio" name="qualiRadio" value="0" onclick={ updateQualifier } > "</label>
            <label class="radio-label"><input type="radio" name="qualiRadio" value="1" onclick={ updateQualifier } > '</label>
          </li>
        </ul>

        
        <br> 
        
        <div class="c-card">
          <div class="c-card__item c-card__item--warning" align = "center" style = "height:30px;">Raw Data</div>
          <div class="c-card__item--brand"><div style = "height:175px; overflow-y: scroll; word-wrap: break-word;">{this.rawData.slice(0, this.opt)}</div></div>
        </div>

        <br>
        <div align ="center">
          <button onclick = { parseRawData } class="c-button c-button--success">Parse</button>
        </div>
        <br>

        <div class="c-card" if = {verify}>
          <div class="c-card__item c-card__item--warning" align = "center" style = "height:30px;">Parsed Data</div>
          <div style = "overflow-y: scroll; height:250px; overflow-x: scroll; width: 100%;">
            <table>
              <thead>
                <tr>
                  <th each = {column in result.header}>{column}</th>
                </tr>
              </thead>
              <tbody>
                <tr each = {row in result.sample.slice(0, (result.sample.length>10?10:result.sample.length))} >
                  <td each = {field in row}>{field}</td>
                </tr>
              <tbody>
            </table>
          </div>
        </div>
      
      </div>
      <br>
      <div class = "seperator"/> 
      <br>
      <div align = "center">
        <button onclick = { previous } class="c-button c-button--error" type="button">Go Back</button>
        <button onclick = { accept } if = {verify} class="c-button c-button--success" type="button">Accept and Continue</button>
      </div>
      <br>
      
    </div>
  </div>

  

  <rg-modal if = {alert}></rg-modal>

  <script>

  const DELIMITERS = [";", ",", "\t", "|", " "],
        QUALIFIERS = ["\"", "'"];

  this.delimiter = ";";
  this.qualifier = "\"";

  this.on("mount", function() 
  {
    this.alert = false
    if (window.File && window.FileReader && window.FileList && window.Blob) 
    {
      this.dropZone.addEventListener('click', this.openDialog);
      this.dropZone.addEventListener('dragover', stop(indicateCopyAction), false);
      this.dropZone.addEventListener('drop', stop(this.handleFile), false);
      this.fileInput.addEventListener('change', stop(this.handleFile), false);
      this.setState("ready");
    } 
    else 
      this.setState("unsupported");
    
    if(this.opts.state.rawData)
      this.setState("success")
    
    this.rawData = this.opts.state.rawData
  })


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

  accept()
  {
      this.opts.resolver({result: this.result, del: this.delimiter, qual: this.qualifier},this.opts.path, this.opts.path+"/upload_parse")
      this.unmount()
  }
 
  updateDelimiter() 
  {
    var idx = parseInt(this.delimSelect.value);
    if (idx < 0)        
      this.delimiter = this.customDelim.value.slice(0, 1);
    else 
      this.delimiter = DELIMITERS[idx]    
  }

  updateQualifier() 
  {
    for (var i = 0; i < this.qualiRadio.length; i++) 
    {
      if (this.qualiRadio[i].checked) 
      {
        this.qualifier = QUALIFIERS[i];
        return void this.parseRawData();
      }
    }
  }

  parseRawData() 
  {
    this.showInd = true
    if (this.rawData) 
    {
      var xhttp = new XMLHttpRequest()
      xhttp.open("POST", "http://localhost:8080/parse", true)
      xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
      var body = JSON.stringify({data:this.rawData, delimitter:this.delimiter})
      xhttp.send(body)

      var tag = this
      xhttp.onreadystatechange = function() 
      {
        if (this.readyState == 4)
        {
          if(this.status == 200) 
            tag.check(this.responseText)
          else
          {
            riot.mount('rg-alerts', 
            {
              alerts:[{
                type: "error",
                text: "parsing error, try another delimitter or contact webmaster",
                timeout: 3000
              }]
            })
          }
        }
      }
    }
  }

  check(response)
  {
    this.result ={}
    var obj = JSON.parse(response)
    this.result.header = obj[0];
    
    if(this.opts.state.complete)
      this.result.sample = obj.slice(1, obj.length)
    else
      this.result.sample = obj.slice(1, (obj.length>11?11:obj.length))

    if ((this.result) && (this.result.header) && (this.result.header.length > 1) && (this.result.sample)) 
    {
      this.indicator.className = "indicator valid";
      this.verify = true;     
    } 
    else 
    {
      this.indicator.className = "indicator invalid";
      this.verify = false; 
    }

    this.update()
  }

  function stop(fn) 
  {
    return function(evt) 
    {
      evt.stopPropagation();
      evt.preventDefault();
      return fn.apply(null, arguments);
    }
  }

  function indicateCopyAction(evt) 
  {
    evt.dataTransfer.dropEffect = 'copy';
  }

  this.openDialog = function(evt) 
  {
      this.fileInput.value = null;
      this.fileInput.click();
  }.bind(this);

  this.handleFile = function(evt) 
  {
    var file = (evt.dataTransfer) ? evt.dataTransfer.files[0] : evt.target.files[0];
    if (file === void 0) 
    {
      return void this.setState("error");
    }
    
    var reader = new FileReader();
    reader.onload = function(evt)
    {
      this.setState("success");
      this.rawData = evt.target.result;
      this.rawData = this.rawData.slice(0, this.rawData.lastIndexOf('\n'))
      
      this.opt = this.rawData.length>10000 ? 10000 : this.rawData.length

      var newln = this.getNewlineStr(this.rawData.slice(0, this.opt))
      var abc = this.guessQuoteAndDelimiter(this.rawData.slice(0, this.opt), newln)

      var check = DELIMITERS.indexOf(abc.delim)
      this.delimSelect.value = check
      this.updateDelimiter()
      
      if(abc.quote == "\"")
        this.qualiRadio[0].checked = true
      else
        this.qualiRadio[1].checked = true

      this.update()

      this.parseRawData()
      this.update()

    }.bind(this);

    reader.onerror = function(evt) 
    {
        this.setState("error");
        this.rawData = undefined;
        this.update()
    }.bind(this);

    if (file.size > 16*1024 && !this.opts.state.complete)
    {
      var sliceFn = ('webkitSlice' in file) ? 'webkitSlice' : ('mozSlice' in file) ? 'mozSlice' : 'slice'; reader.readAsText(file[sliceFn](0, 16*1024))
    }
    else 
      reader.readAsText(file)
   }.bind(this);

  this.setState = function(state) 
  {
    this.dropZone.className = "dropzone "+state;
  }


  this.getNewlineStr =  function(sample) 
  {
    var candidates = ["\r\n", "\n\r", "\n", "\r"];
    var nrLines = {};

    var lineLengths = {};
    var threshold = 5; // at least this many lines

    candidates.forEach(function(newlineStr) {
      nrLines[newlineStr] = 1;
      var l = [];
      var curPos = 0;
      var newlinePos = 0
      while((newlinePos = sample.indexOf(newlineStr, curPos)) > -1) {
        ++nrLines[newlineStr];
        var lineLength = newlinePos - curPos;
        l.push(lineLength);
        curPos = newlinePos + newlineStr.length;
      }
      lineLengths[newlineStr] = l;
    });

    ["\r\n", "\n\r"].forEach(function(newlineStr) {
      var nr = nrLines[newlineStr];
      if(nr > 1) {
        ["\n", "\r"].forEach(function(newlineStr) {
          if(nrLines[newlineStr] == nr) {
            nrLines[newlineStr] = 1;
          }
        });
      }
    });

    var remainingCandidates = [];
    candidates.forEach(function(newlineStr) {
      if(nrLines[newlineStr] > 1) {
        remainingCandidates.push(newlineStr);
      }
    });

    if(remainingCandidates.length == 0) {
      return null;
    }
    if(remainingCandidates.length == 1) {
      return remainingCandidates[0];
    }

    var finalRemainers = [];
    var maxNrLines = 0;
    remainingCandidates.forEach(function(newlineStr) {
      var curNrLines = nrLines[newlineStr];
      maxNrLines = Math.max(maxNrLines, curNrLines);
      if(curNrLines > threshold) {
        finalRemainers.push(newlineStr);
      }
    });

    if(finalRemainers.length == 0) {
      var winner = null;
      remainingCandidates.some(function(newlineStr) {
        if(nrLines[newlineStr] == maxNrLines) {
          winner = newlineStr;
          return true;
        }
        return false;
      });
      return winner;
    }
    if(finalRemainers.length == 1) {
      return finalRemainers[0];
    }

    var winner = null;
    var winnerScore = Infinity;
    finalRemainers.forEach(function(newlineStr) {
      var l = lineLengths[newlineStr];
      var sum = 0;
      l.forEach(function(d) { sum += d; });
      var avg = sum / l.length;

      var absSum = 0;
      l.forEach(function(d) { absSum += Math.abs(d - avg); });
      var score = absSum / l.length / avg; // this calculates absolute differences, normalized to # lines and length of lines

      if(score < winnerScore) {
        winnerScore = score;
        winner = newlineStr;
      }
    });
    return winner;
  }


 this.guessQuoteAndDelimiter = function(sample, newlineStr, delimiters) 
 {
    var exprs = [];
    var nl = newlineStr.replace("\n", "\\n").replace("\r", "\\r");
    var delimiter = "([^"+nl+"\"'])";
    var content = "[^"+nl+"]*?";
    exprs.push({
      expr: new RegExp(
          delimiter     + // Delimiter
          "\\s*?"       + // Possible whitespace between delimiter and quote char
          "([\"'])"     + // Quote character
          content       + // Non-greedy parsing of string between quotes
          "\\2"       + // Matching quote character
          "\\s*?"       + // Possible whitespace between quote char and delimiter
          "\\1"         // Matching delimiter
        , "g"),
      delimRef: 1,
      quoteRef: 2
    });

    exprs.push({
      expr: new RegExp(
            "^"         + // Start of line (note that javascript treats the start of every line as ^)
            "\\s*?"       + // Possible whitespace at start of line
            "([\"'])"     + // Quote character
            content       + // Non-greedy parsing of string between quotes
            "\\1"       + // Matching quote character
            "\\s*?"       + // Possible whitespace between quote char and delimiter
            delimiter       // Delimiter
          , "g"),
      delimRef: 2,
      quoteRef: 1
    });

    exprs.push({
      expr: new RegExp(
            delimiter     + // Delimiter
            "\\s*?"       + // Possible whitespace between delimiter and quote char
            "([\"'])"     + // Quote character
            content       + // Non-greedy parsing of string between quotes
            "\\2"       + // Matching quote character
            "\\s*?"       + // Possible whitespace between quote char and end of line
            "$"           // End of line (note that javascript treats the end of every line as $)
          , "g"),
      delimRef: 1,
      quoteRef: 2
    });

    exprs.push({
      expr: new RegExp(
            "^"         + // Start of line (note that javascript treats the start of every line as ^)
            "\\s*?"       + // Possible whitespace at start of line
            "([\"'])"     + // Quote character
            content       + // Non-greedy parsing of string between quotes
            "\\1"       + // Matching quote character
            "\\s*?"       + // Possible whitespace between quote char and end of line
            "$"           // End of line (note that javascript treats the end of every line as $)
          , "g"),
      quoteRef: 1
    });

    var matches = [];

    exprs.every(function(d) { // use every here, so we can stop the loop by returning false
      var matchesNew;
      while(matchesNew = d.expr.exec(sample)) {
        var match = {};
        if(d.delimRef && matchesNew[d.delimRef]) match.delim = matchesNew[d.delimRef];
        if(d.quoteRef && matchesNew[d.quoteRef]) match.quote = matchesNew[d.quoteRef];
        matches.push(match);
      }

      return matches.length == 0; // only go to next regexp if matches is still empty
    });
    if(matches.length == 0) {
      return { delim: null, quote: null };
    }

    var delimCounters = {};
    var quoteCounters = {};

    matches.forEach(function(d) {
      if(d.hasOwnProperty("delim") && (!delimiters || delimiters.indexOf(d.delim) > -1)) {
        if(!delimCounters.hasOwnProperty(d.delim))  delimCounters[d.delim] = 1;
        else                    ++delimCounters[d.delim];
      }
      if(d.hasOwnProperty("quote")) {
        if(!quoteCounters.hasOwnProperty(d.quote))  quoteCounters[d.quote] = 1;
        else                    ++quoteCounters[d.quote];
      }
    });

    var delims = Object.keys(delimCounters);
    var quotes = Object.keys(quoteCounters);

    var delim = null;
    if(delims.length > 0) {
      var maxCount = -1;
      delims.forEach(function(d) { 
        if(delimCounters[d] > maxCount) {
          delim = d;
          maxCount = delimCounters[d];
        }
      });
    }

    var maxCount = -1;
    var quote = ''
    quotes.forEach(function(d) {
      if(quoteCounters[d] > maxCount) {
        quote = d;
        maxCount = quoteCounters[d];
      }
    });

    if(delim == "\n") {
      delim = null;
    }

    return {
      delim: delim,
      quote: quote
    }
  }

</script>

<style>

p.test {
    width: 100%;
    word-wrap: break-word;
}
table {
    border-collapse: collapse;  
}

table, th, td {
    text-align: left;
    border: 1px solid black;
    width: 100%;
}

tr:nth-child(even){background-color: #f2f2f2}

th {
    background-color: #4CAF50;
    color: white;
}


</style>


</my-sample-upload>
