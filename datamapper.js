function datamapper(mapContainer, mapType, data) {
  var selectedField;
  var selectedSeq;
  var choropleth = [];
  choropleth["null"] = "#fff";
  choropleth["q0-9"] = "#eee";
  choropleth["q1-9"] = "#ccc"; 
  choropleth["q2-9"] = "#b2b2b2"; 
  choropleth["q3-9"] = "#999"; 
  choropleth["q4-9"] = "#808080"; 
  choropleth["q5-9"] = "#666"; 
  choropleth["q6-9"] = "#4d4d4d"; 
  choropleth["q7-9"] = "#333"; 
  choropleth["q8-9"] = "#000";

  // clear map div
  d3.select(mapContainer).html("");
  
  // set content vars
  var id;
  var width = 960,
      height = 600;
  var formatNumber = d3.format(",.0f");
  var path = d3.geo.path()
      .projection(null);
  var ttwidth = 220,
      ttheight = 100;
  
  // append map svg
  var svg = d3.select(mapContainer).append("svg")
      .attr("width", width)
      .attr("height", height);
  
  // append legend div
  var legendContainer = d3.select(mapContainer).append("div")
    .attr("id", "dm-legend-container");

  // append button stuff
  var buttonContainer = d3.select(mapContainer).append("div")
    .attr("class","dm-button-container");
  buttonContainer.append("h4").html("Generated fields");
  buttonContainer.append("p").html("The buttons generated here represent fields from the CSV data below.");
  buttonContainer.append("div")
    .attr("id","dm-sequence-btns")
    .attr("class","btn-group");
  buttonContainer.append("div")
    .attr("id","dm-fld-btns")
    .attr("class","btn-group");

  // append tooltip
  var tooltipContainer = d3.select(mapContainer).append("div")
    .attr("class", "dm-tooltip")
    .style("opacity", 0)
    .style("width",ttwidth+"px")
    .style("min-height",ttheight+"px");

  queue()
    .defer(d3.json, "us.json")
    .defer(d3.json, "counties.json")
    .await(ready);

  function ready(error, us, counties) {
    // get field names for values
    var keys = Object.keys(data[0]);
    var valFields = [];
    var str = "{";
    keys.forEach(function(d,i) {
      var comma = (i == keys.length-1) ? "" : ","
      str += '"'+d+'":0'+comma;
      if (d !== "sequence" && d !== "fips") {
        valFields.push(d);
      }
    });
    str += "}";
    // create empty array for nulls in input
    var emptyArr = JSON.parse(str);
    // set selected field to first in array
    selectedField = valFields[0];

    // get range of sequence field, then sort, then get min and max
    var seqs = [];
    data.forEach(function(d) {
      d.fips = d3.format('05')(parseInt(d.fips));
      if (seqs.indexOf(d.sequence) == -1) {
        seqs.push(d.sequence);
      }
    });
    selectedSeq = seqs[0];
    seqs.sort(function(a,b) { return a-b; });
    var startSeq = d3.min(seqs);
    var endSeq = d3.max(seqs);

    // nest up the inputted data
    var nestedData = d3.nest()
      .key(function(d) { return d.fips; })
      .key(function(d) { return d.sequence; })
      .map(data);

    // add buttons for sequences, init mapData
    var mapData = [];
    if (typeof seqs[0] !== "undefined") {
      seqs.forEach(function(seq) {
        mapData[seq] = [];
        var btnactive = (seq == startSeq) ? "active" : "";
        d3.select("#dm-sequence-btns").append("button")
          .attr("class","dm-sequence-btn btn "+btnactive)
          .attr("id",seq)
          .html(seq)
      });
    } else {
      mapData["undefined"] = [];
      d3.select("#dm-sequence-btns").html("")
    }

    // create fipstocounty
    var fipstocounty = [];
    topojson.feature(us, us.objects.counties).features.forEach(function(d) {
      fipstocounty[d.id] = d;
    });

    // create node for each county in mapData, create fipstoname
    var fipstoname = [];
    counties.forEach(function(county) {
      fipstoname[county.fips] = county.county;
      seqs.forEach(function(seq) {
        if (typeof nestedData[county.fips] !== "undefined" && typeof nestedData[county.fips][seq] !== "undefined") {
          mapData[seq].push(nestedData[county.fips][seq][0]);
        } else {
          // push the empty array if there's no inputted data for this county
          mapData[seq].push(emptyArr);
        }
      });
    });

    // create array of min,max,median for all value fields
    // add buttons for value fields
    var minmax = [];
    valFields.forEach(function(d) {
      minmax[d] = [];
      seqs.forEach(function(seq) {
        minmax[d][seq] = [
          d3.min(data, function(d0) { return +d0[d];}),
          d3.max(data, function(d0) { return +d0[d];}),
          d3.median(data, function(d0) { return +d0[d];})
        ];        
      })
      var btnactive = (d == selectedField) ? "active" : "";
      d3.select("#dm-fld-btns").append("button")
        .attr("class","dm-fld-btn btn "+btnactive)
        .attr("id",d)
        .html(d)
    });

    // dynamic radius
    var radius = d3.scale.sqrt()
      .domain([0, minmax[selectedField][endSeq][1]])
      .range([0, 15]);

    // setup legend
    var lwidth = 160,
        lheight = 50;
    // append legend svg
    var legendSvg = legendContainer.append("svg")
        .attr("width", lwidth)
        .attr("height", lheight);

    if (mapType == "bubble") {
      // bubbles
      legendSvg.selectAll(".dm-legend-dots")
        .data([1,minmax[selectedField][endSeq][1]])
      .enter().append("circle")
        .attr("class","dm-legend-dots")
        .attr("cx",function(d) { return radius(minmax[selectedField][endSeq][1]) })
        .attr("cy",function(d,i) { return (radius(d)*2) })
        .attr("r",function(d) { return radius(d); });
      
      legendSvg.selectAll(".dm-legend-text")
        .data([1,minmax[selectedField][endSeq][1]])
      .enter().append("text")
        .attr("class","dm-legend-text")
        .attr("x",function(d) { return (radius(minmax[selectedField][endSeq][1])*2)+5 })
        .attr("y",function(d,i) { return (radius(d)*2)+5 })
        .attr("text-anchor","start")
        .text(function(d) { return d+" "+selectedField });

      svg.append("g")
      .selectAll(".dm-dots")
        .data(mapData[startSeq])
      .enter().append("circle")
        .attr("class","dm-dots")
        .attr("id",function(d) { return d.fips })
        .attr("transform", function(d) {
          var coord = (path.centroid(fipstocounty[d.fips])[0] > 0 && path.centroid(fipstocounty[d.fips])[1] > 0) ? path.centroid(fipstocounty[d.fips]) : [-1000,-1000];
          return "translate(" + coord + ")";
        })
        .attr("r", function(d) { 
          var dotsize = (radius(d[selectedField]) >= 0) ? radius(d[selectedField]) : 0;
          return dotsize; 
        });     
    } else {
      // choropleth
      var quantize = d3.scale.quantize()
        .domain([0, minmax[selectedField][selectedSeq][1]/2])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
      svg.append("g")
        .attr("class", "dm-counties")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("class","dm-county")
        .attr("id",function(d) { return d.id })
        .attr("d", path)
        .call(getFill);       
    }

    svg.append("path")
      .datum(topojson.feature(us, us.objects.nation))
      .attr("class", "dm-nation")
      .attr("id","dm-nation-shape")
      .attr("d", path);

    // tooltip on mouseover
    d3.selectAll(".dm-dots,.dm-county")
      .on("mouseover",function(d){
        if (mapType == "choropleth") {
          d3.select(this).style("fill","steelblue");
        }
        var fips = (parseInt(d.fips) > 0) ? d.fips : d.id;
        var coord = (path.centroid(fipstocounty[fips])[0] > 0 && path.centroid(fipstocounty[fips])[1] > 0) ? path.centroid(fipstocounty[fips]) : [0,0];
        var tiptext = "<p style='border-bottom:1px solid #ddd'><span class='bold'>"+fipstoname[fips]+"</span></p>";
        keys.forEach(function(key) {
          if (typeof nestedData[fips] !== "undefined" && typeof nestedData[fips][selectedSeq] !== "undefined") {
            tiptext += key+": "+nestedData[fips][selectedSeq][0][key]+"<br>";
          }
        });
        tooltipContainer
          .html(tiptext)
          .style("left", coord[0]+10+"px")
          .style("top", coord[1]+10+"px")
          .style("opacity", 1);
      })
      .on("mouseout",function() {
        if (mapType == "choropleth") {
          d3.select(this)
            .style("fill",function(d) {
              var fixedfips = d3.format('05')(parseInt(d.id));
              if (typeof nestedData[fixedfips] === "undefined" || typeof nestedData[fixedfips][selectedSeq] === "undefined") {
                return choropleth["null"];
              } else {
                return choropleth[quantize(nestedData[fixedfips][selectedSeq][0][selectedField])];
              }
            })          
        }
        tooltipContainer
          .style("left","-1000px")
          .style("opacity", 0);
      });

    d3.selectAll(".dm-sequence-btn").on("click",function() {
      id = this.id;
      selectedSeq = id;
      $("#"+id).addClass("active").siblings(".dm-sequence-btn").removeClass("active");
      if (mapType == "bubble") {
        d3.selectAll(".dm-dots")
          .data(mapData[id])
          .call(changeSeq);     
      } else {
        d3.selectAll(".dm-county").call(getFill);
      }
    });

    d3.selectAll(".dm-fld-btn").on("click",function() {
      id = this.id;
      selectedField = id;
      $("#"+id).addClass("active").siblings(".dm-fld-btn").removeClass("active");
      if (mapType == "bubble") {
        radius.domain([0, minmax[selectedField][endSeq][1]])
        d3.selectAll(".dm-dots").call(changeSeq);
        legendSvg.selectAll(".dm-legend-text")
          .data([1,minmax[selectedField][endSeq][1]])
          .call(changeLegendText);
      } else {
        d3.selectAll(".dm-county").call(getFill);
      }
    });

    function getFill(selection) {
      selection
        .transition()
        .duration(1000)
        .style("fill",function(d) {
          var fixedfips = d3.format('05')(parseInt(d.id));
          if (typeof nestedData[fixedfips] === "undefined" || typeof nestedData[fixedfips][selectedSeq] === "undefined") {
            return choropleth["null"];
          } else {
            return choropleth[quantize(nestedData[fixedfips][selectedSeq][0][selectedField])];
          }
        })
    }

    function changeLegendText(selection) {
      selection
        .transition()
        .duration(1000)
        .text(function(d) { return d+" "+selectedField });
    }

    function changeSeq(selection) {
      selection
        .transition()
        .duration(1000)
        .attr("r", function(d) { 
          var dotsize = (radius(d[selectedField]) >= 0) ? radius(d[selectedField]) : 0;
          return dotsize; 
        });
    }
  }
}