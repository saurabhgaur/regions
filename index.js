/*global $, $window, window, d3, _ */
var json; 
var domain; //uniq lis of marks in data
var colorScale;
/*function getArray(){
    json = $.getJSON("data.json");
    return json;
}*/


/*function getCSVArray(fileName){
    return nestedGeneData;
    });
retrun geneData;
}
*/
//json = getCSVArray("data.csv");

function addViz(json, geneName){
//var data = [4, 8, 15, 16, 23, 42];
var geneData = json[geneName];

var width = 420,
    height = 100,
    barHeight = 10,
    padding = 20,
    availableHeight = height-padding,
    marksRegionHeight = 0.5*availableHeight;

/*var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, width]);*/

var chart = d3.select("svg#div_"+geneName)
    .attr("width", width)
    .attr("height",height);

/*var bar = chart.selectAll("g")
          .data(geneData)
          .enter().append("g")
          .attr("transform", function(d,i){return "translate(0,"+i*barHeight+")"; });
  */  
var geneX = d3.scale.linear()
            .domain([geneData[0].TiledRegionStart,geneData[0].TiledRegionStop])
            .range([10, width-10]);

var geneY = d3.scale.ordinal()
    .domain(['Ab2_G0','Ab4_G0','Ab6_G0','Ab7_G0'])
    .range([0, 0.25*marksRegionHeight,0.5*marksRegionHeight,0.75*marksRegionHeight]);


var bar = chart.selectAll("g")
	.data(geneData)
	.enter().append("g")
	.attr("transform", function(d,i) {
	    return "translate("+ geneX(d.RegionStart)+"," + geneY(d.Mark) + ")"; 
	});


bar.append("rect")
.attr("width",function(d,i){return geneX(d.RegionStop)-geneX(d.RegionStart)})
.attr("height", barHeight - 1)
.style("fill", function(d, i) { return colorScale(d.Mark); });





var tiledRegionBar = chart.append("g")
.attr("transform", "translate("+geneX(geneData[0].TiledRegionStart)+","+0.75*availableHeight+")");

tiledRegionBar.append("rect")
.attr("width",geneX(geneData[0].TiledRegionStop) - geneX(geneData[0].TiledRegionStart))
.attr("height", barHeight/2)
.style("fill","red");

var geneBar = chart.append("g")
.attr("transform", "translate("+geneX(geneData[0].GeneStart)+","+0.75*availableHeight+")");

geneBar.append("rect")
.attr("width",geneX(geneData[0].GeneStop) - geneX(geneData[0].GeneStart))
.attr("height", barHeight)
.style("fill","black");

var formatValue = d3.format(".2s");
chart.append("g")
    .attr("class", "axis")  //Assign "axis" class
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call( d3.svg.axis()
	.scale(geneX)
	.orient("bottom")
	.ticks(5)
	.tickFormat(function(d) { return formatValue(d);})
	 );

/*bar.append("text")
    .attr("x", function(d) { return x(d) - 3; })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function(d) { return d; });
*/
}

function bindData(json){
    $.each(json, function (key, obj) {
        //console.log(key, obj);
        $('<div />', {
            id: key,
            class:"panel"   
        })
	.append("<div class='name'>"+obj[0].Gene+"</div>")
	.append("<div class='tiledregionlength'>"+(obj[0].TiledRegionStop - obj[0].TiledRegionStart)+"</div>")
	.append("<svg class='chart' id='div_"+obj[0].Gene+"'></svg>")
	.appendTo('#Content');
	addViz(json, obj[0].Gene);
    });
}

function layoutPanels() {
  // init Isotope
    var $container =$('#Content').isotope({
    itemSelector: '.panel',
    layoutMode: 'masonry',
    masonry: {
      columnWidth: 80,
      gutterWidth: 10
    },
    cellsByRow: {
      columnWidth: 220,
      rowHeight: 220
    },
    masonryHorizontal: {
      rowHeight: 110
    },
    cellsByColumn: {
      columnWidth: 220,
      rowHeight: 220
    },
    getSortData: {
      name: '.name',
      tiledregionlength: '.tiledregionlength parseInt',
      symbol: '.symbol',
      number: '.number parseInt',
      category: '[data-category]',
      weight: function( itemElem ) {
        var weight = $( itemElem ).find('.weight').text();
        return parseFloat( weight.replace( /[\(\)]/g, '') );
      }
    }
  });

    var isHorizontal = false;
    var $window = $(window);

  $('#layout-mode-button-group').on( 'click', 'button', function() {
    // adjust container sizing if layout mode is changing from vertical or horizontal
    var $this = $(this);
    var isHorizontalMode = !!$this.attr('data-is-horizontal');
    if ( isHorizontal !== isHorizontalMode ) {
      // change container size if horiz/vert change
      var containerStyle = isHorizontalMode ? {
        height: $window.height() * 0.7
      } : {
        width: 'auto'
      };
      $container.css( containerStyle );
      isHorizontal = isHorizontalMode;
    }
    // change layout mode
    var layoutModeValue = $this.attr('data-layout-mode-value');
    $container.isotope({ layoutMode: layoutModeValue });
  });  




  // filter functions
  var filterFns = {
    // show if number is greater than 50
    numberGreaterThan50: function() {
      var number = $(this).find('.number').text();
      return parseInt( number, 10 ) > 50;
    },
    // show if name contains input string
    filterText: function() {
      var filterText = $('.filterText').val();	
      var name = $(this).find('.name').text();
      return name.match( filterText );
    },
   filterSignificantMarks: function(){
       var significantMarks = $('.filterSignificantMarks').val();
       var currentGeneData = json[this.id];
      
       return (currentGeneData.length<significantMarks);
   }

  };

  // bind filter button click
  $('#filters').on( 'click', 'button', function() {
    var filterValue = $( this ).attr('data-filter-value');
    // use filterFn if matches value
    filterValue = filterFns[ filterValue ] || filterValue;
    $container.isotope({ filter: filterValue });
  });
 
  // bind filter text box
  $('#filterTextDiv').on( 'change', 'input',  function() {
    var filterValue = $( this ).attr('data-filter-value');
    // use filterFn if matches value
    filterValue = filterFns[ filterValue ] || filterValue;
    $container.isotope({ filter: filterValue });
  });



  // bind sort button click
  $('#sorts').on( 'click', 'button', function() {
    var sortValue = $(this).attr('data-sort-value');
    $container.isotope({ sortBy: sortValue });
  });

  

  
  
  // change is-checked class on buttons
  $('.button-group').each( function( buttonGroup ) {

    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
      $buttonGroup.find('.is-checked').removeClass('is-checked');
      $( this ).addClass('is-checked');
    });
  });
  
}

function drawLegend(dataset) {
    
    var width = 420,
    height = 80;

    
    // add legend   
    var legend = d3.select("#legend").append("svg")
        //.attr("x", w - 65)
        //.attr("y", 50)
	.attr("height", height)
	.attr("width", width)
	.append("g")
	.attr('transform', 'translate(0,10)');    
      
    
    legend.selectAll('rect')
      .data(dataset)
      .enter()
      .append("rect")
	  .attr("x", function(d, i){ return i * 100 + 10;})
      .attr("y",20)
	  .attr("width", 10)
	  .attr("height", 10)
	  .style("fill", function(d) { 
        var color = colorScale(d);
        return color;
      });
      
    legend.selectAll('text')
      .data(dataset)
      .enter()
      .append("text")
	.attr("x", function(d, i){ return i * 100 + 25;})
      .attr("y",30)
	.attr("fill",function(d,i) {return colorScale(d);})
	  .text(function(d) {
        var text = d;
        return text;
      });
}

function main(){
    
    d3.select("#Content");
    d3.csv("G0_Input_Without_Ab3.csv", function(csv){

	domain = _.uniq(_.pluck(csv,"Mark")).sort();
	colorScale = d3.scale.category10();
	colorScale.domain(domain);
	drawLegend(domain);
	json = d3.nest()
	.key(function(d) {
	    return d.Gene;
	})
	.map(csv);
        bindData(json);	
        $(layoutPanels());
    
    });
}


