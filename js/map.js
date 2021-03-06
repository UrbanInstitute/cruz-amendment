

/*  This visualization was made possible by modifying code provided by:

http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922 */




//Create SVG element and append map to the SVG


function drawMap(container_width) {

	d3.csv("states-data_old.csv", function(data) {

	  d3.json("us-states.json", function(json) {
	    for (var i = 0; i < data.length; i++) {
	      var dataState = data[i].state;
	      var dataAbbr = data[i].abbr;
	      var dataLink = (data[i].link == "" || data[i].abbr == "WY") ? false : data[i].link;
        if(typeof(dataLink) == "undefined"){
          dataLink = false;
        }


	      for (var j = 0; j < json.features.length; j++)  {
	        var jsonState = json.features[j].properties.name;

	        if (dataState == jsonState) {
	        // Copy the data value into the JSON
	        json.features[j].properties.abbr = dataAbbr; 
	        json.features[j].properties.link= dataLink;

	        // Stop looking through the JSON
	        break;
	        }
	      }
	      
	    }
  var IS_MOBILE = d3.select("#isMobile").style("display") ==  "block";
  var IS_PHONE = d3.select("#isPhone").style("display") == "block";

  //Width and height of map
    $mapContainer = $("#map-container")
    $tooltipHeader = $(".tooltip-container")
    $mapContainer.empty();
    $tooltipHeader.empty();
    aspect_width = 15;
    aspect_height = 8;
    margin = { top: 0, right: 20, bottom: 0, left: 20 };
    width= container_width
    height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom; 

// D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([width/2, height/2])    // translate to center of screen
               .scale([width]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

      svg = d3.select("#map-container")
          .append("svg")
          .attr("width", width)
          .attr("height", height);
    // Bind the data to the SVG and create one path per GeoJSON feature]
    console.log(json.features)
    var states = svg.selectAll("path")
    	.data(json.features)
    	.enter()
    	.append("svg:a")    
      .attr("xlink:href", function(d) { 
          if(d.properties.link != false){ 
            return d.properties.link
          }else{
            return null;
          }
        	return d.properties.link
      })
      .attr('target','_blank')
    	.append("path")
    	.attr("d", path)
    	.attr("class", function(d) {
        var disabled = (d.properties.link != false || d.properties.abbr == "WY") ? "" : " disabled" 
    		return "state " + d.properties.abbr + disabled;
    	})
    	.style("stroke", "#fff")
    	.style("stroke-width", "1")

  //ADD LEADER LINE FOR DC
    var dcData = json.features.filter(function(d) {return d.properties.name == "District of Columbia"})


/********* UNCOMMMENT ME FOR DC ********************/

    var dcLine1 = svg.append("line")
      .attr("x1", .764*(width))
      .attr("y1", .238*(width))
      .attr("x2", .835*(width))
      .attr("y2", .238*(width))
      .attr("stroke-width", 1.2)
      .attr("stroke", "#ec008b")
    var dcLine2 = svg.append("line")
      .attr("x1", .835*(width))
      .attr("y1", .238*(width))
      .attr("x2", .835*(width))
      .attr("y2", function() {
        if (IS_PHONE){
          return .26*(width)
      } else { 
        return .22*(width)}
      })
      .attr("stroke-width", 1.2)
      .attr("stroke", "#ec008b")
    var dcText = svg.append("a")
      .attr("xlink:href", "http://www.urban.org/sites/default/files/publication/92121/district_of_columbia_state_fact_sheet_7-21_finalized_0.pdf")
      .attr('target','_blank')
      .data(dcData)
      .append("text")
      .text(function(d) { 
      if (IS_PHONE) {
        return "District of";
      } else {
        return d.properties.name; }
      })
      .attr("x", .8*(width))
      .attr("y", function() { 
        if (IS_PHONE) {
          return .28*(width)
        } else { 
          return .215*(width)}
        })
      .attr("class", "state-label state")    
    var dcText2= svg.append("a")
      .attr("xlink:href", "http://www.urban.org/sites/default/files/publication/92121/district_of_columbia_state_fact_sheet_7-21_finalized_0.pdf")
      .attr('target','_blank')
      .data(dcData)
      .append("text")
      .text(function(d) { 
        if (IS_PHONE) {
          return "Columbia"}
          else {return ""}
        })
      .attr("x", .8*(width))
      .attr("y", .303*(width))
      .attr("class", "state-label state")    

/********* END UNCOMMMENT ME FOR DC ********************/

  //STATE TOOLTIP


    var tooltip = d3.select(".tooltip-container")


    var region = tooltip.append('div')
    	.attr('class', 'region-text')
    region.append('div')
    	.attr('class', 'tooltip-title')
    	.text('STATE')

    function selectState(selectedState) {

    d3.selectAll(".state")
      .classed('deselected', true)
      .classed('selected', false)
    d3.select(".state." + selectedState)
      .classed('selected', true)
      .classed("deselected", false)
    }

    d3.selectAll(".state")
    	.on("mouseover", function (d) {
               dispatch.call("hoverState", this, (d3.select(this).attr('class')))
            })
    	.on("mouseout", function (d) {
               dispatch.call("dehoverState")
            })

    var dispatch = d3.dispatch("hoverState", "dehoverState");

    region.append("div")
    		.attr('class', 'tooltip-data')
        .text("Click on a state")


    dispatch.on("hoverState", function (selectedState) {
            var stateName = d3.select(this).datum().properties.name
            selectState(selectedState);
            d3.select(".tooltip-data")
    	     	.html(stateName)
          });
    dispatch.on("dehoverState", function() {
          d3.select(".tooltip-data")
          .html("Click on a state")
    })


    //STATE DROPDOWN MENU
    var defaultOptionName = ""
    var dropdown = tooltip.append('div')
          .attr('class', 'dropdown-text')
    // dropdown.append('div')
    //       .attr('class', 'tooltip-title')
        //  .text('SELECT A STATE')
    var dropdownMenu =dropdown.append('div')
          .attr('class', 'dropdown-container')
          .append("select")
         // .attr("onChange", "window.location.href=this.value")
          .attr("onChange", "window.open(this.value, '_blank') ")
          .selectAll("option")
          .data(json.features.filter(function(d){ return d.properties.link != false}))
          .enter()
          .append("option")
          .text(function(d) {return d.properties.name})
          .attr("value",function(d){return d.properties.link;})
    d3.select('select')
          .append("option")
          .text("Select a state")
          .attr("value","")
          .attr("selected", "selected")
          .attr("disabled", "disabled")
          .attr("hidden", "hidden")


  });

})
}

var pymChild = new pym.Child({ renderCallback: drawMap, polling: 500 });