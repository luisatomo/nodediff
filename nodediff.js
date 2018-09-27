const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const PDFDocument= require("pdfkit")
var doc= new PDFDocument();
var fs = require('fs');
require('colors');
var jsdiff = require('diff');

/*const dom=new JSDOM(``, {
    url: "https://wp-themes.com/twentyfifteen/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000
  });

  const document = dom.window.document;
  const bodyEl = document.body
  const entryContent = bodyEl.querySelector(".entry-content");

  //console.log(bodyEl.textContent);*/

var request = require('request');
var aold= ["https://wp-themes.com/twentyfifteen/"];
var anew=["https://wp-themes.com/twentyseventeen/"];
getPage = function(someUri, callback) {
  request({uri: someUri, headers:{'User-Agent': 'Mozilla/5.0'}}, function (error, response, body) {
    console.log("Fetched " +someUri+ " OK!");
    callback(body);
  });
}

function compareurls(oldUrl, newUrl, maxcount, i){
    doc.addPage();
    if(i>maxcount) { doc.end(); return};
    getPage(aold[i], function(body) {
        doc.fontSize(10).fill("#000000").text("===================");
        doc.text(aold[i]);
        const dom = new JSDOM(body);
        dom.serialize();
        const document=dom.window.document;
        const titleContent1= document.querySelector(".entry-title");
        const entryContent1= document.querySelector(".entry-content");
        getPage(anew[i], function(body) {
            doc.text(anew[i]);
            const dom1 = new JSDOM(body);
            dom1.serialize();
        const document1=dom1.window.document;
        const titleContent2= document1.querySelector(".entry-title");
        const entryContent2= document1.querySelector(".entry-content");
        
        /*if(entryContent1.textContent==entryContent2.textContent){
            
            console.log('Same Text');
        }
        else{
            console.log('Not the Same Text');
        }*/
        //var compare = require('dom-compare').compare,
        //reporter = require('dom-compare').GroupingReporter,
        expected = titleContent1.textContent + " | " + entryContent1.textContent; 
        // expected DOM tree
        actual = titleContent2.textContent + " | " + entryContent2.textContent; 
        // actual one
    
        
    
    var diff = jsdiff.diffWords(expected, actual);
    var countadded=0;
    var extrawords='';
    var countremoved=0;
    var missingwords='';
    diff.forEach(function(part){
            // green for additions, red for deletions
            // grey for common parts
            var color = part.added ? '#00cc00' :
              part.removed ? '#cc0000' : '#cccccc';
              if(part.added){
              countadded=countadded+1;
              if (part.value!=' ')
              extrawords=extrawords + '|' + part.value;
              }
              if(part.removed){
              countremoved=countremoved+1;
              if (part.value!=' ')
              missingwords=missingwords + '|' + part.value;
              }
            //process.stderr.write(part.value[color]);
            doc.fontSize(8).fill(color).text(part.value);
          });
          doc.fontSize(12).fill("#0000CC");
          doc.text(anew[i] + ": extra text: (" + countadded + ") -> "+ extrawords+", text missing: (" + countremoved + ") -> " + missingwords);
          console.log(anew[i] + ": extra text: (" + countadded + ") -> "+ extrawords+", text missing: (" + countremoved + ") -> " + missingwords);
          //return;
          compareurls(oldUrl, newUrl, maxcount, i+1);
          /*result, diff, groupedDiff;
    
    // compare to DOM trees, get a result object
    result = compare(expected, actual);
    
    // get comparison result
    console.log(result.getResult()); // false cause' trees are different
    
    // get all differences
    diff = result.getDifferences(); // array of diff-objects
    
    // differences, grouped by node XPath
    groupedDiff = reporter.getDifferences(result); // object, key - node XPATH, value - array of differences (strings)
    
    // string representation
    console.log(reporter.report(result));*/
        });
    
    });

}
doc.pipe(fs.createWriteStream('comparetoolresponse.pdf'));
compareurls(aold,anew,aold.length-1,0);

//console.log(entryContent.textContent);