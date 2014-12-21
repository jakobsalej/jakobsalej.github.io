
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var grafi=0;
var klik=0;
var zac;


var rezultati = [];
 
$.getJSON("liverpool.json", function(json) {
    
    for(var i = 0; i < json.uvrstitve.length; i++){
        rezultati[i] = [];
        rezultati[i][0] = json.uvrstitve[i].leto;
        rezultati[i][1] = json.uvrstitve[i].mesto;
        
    }
   
});











function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                    
		                    var seznamOseb = document.getElementById("preberiPredlogoBolnika");
		                    var skupekPodatkov = ime+","+priimek+","+datumRojstva;
		                    var skupekPodatkov2 = ehrId+","+ime+","+priimek+","+datumRojstva;
		                    seznamOseb.options[seznamOseb.length] = new Option(ime + " " + priimek, skupekPodatkov);
		                    
		                    
		                    document.getElementById("preberiObstojeciVitalniZnak").options[document.getElementById("preberiObstojeciVitalniZnak").length] = new Option(ime + " " + priimek, ehrId);
		                    document.getElementById("preberiEhrIdZaVitalneZnake").options[document.getElementById("preberiEhrIdZaVitalneZnake").length] = new Option(ime + " " + priimek, skupekPodatkov2);
		                    
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}


function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}



function zgenerirajPodatke() {
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var h = today.getHours();
	var min = today.getMinutes();

	if(dd<10) {
    	dd='0'+dd
	} 

	if(mm<10) {
    	mm='0'+mm
	}
	
	if(h<10) {
    	h='0'+h
	}
	
	if(min<10) {
    	min='0'+min
	}
	
	$("#dodajVitalnoDatumInUra").val(yyyy+"-"+mm+"-"+dd+"T"+h+":"+min);
	
	var visina = 0;
	var teza = 0;
	var merilec = "Zdravniska sluzba";
	
	if($("#dodajVitalnoEHR").val()== "487d92f3-9e24-4a3b-bf89-45308eabb819") {
		visina=185;
		teza = 83;
		merilec = "Dallas Mavericks medical team";
	}
	else if($("#dodajVitalnoEHR").val()== "aa4612a6-1922-497a-93b3-5f99e6b7ebcb") {
		visina = 211;
		teza = 115;
		merilec = "Brooklyn Nets medical team";
	}
	else if($("#dodajVitalnoEHR").val()== "f2dec618-6bd8-498f-bbfa-3d10bea08a70") {
		visina = 201;
		teza = 107;
		merilec = "Washington Wizards medical team";
	}
	else{
		visina = 179;
		teza = 75;
	}
	
	var random = Math.random();
		
	var razlika = teza/10*Math.random();
		
	if(random > 0.5){
		teza = teza - razlika;
	}
	else
		teza = teza + razlika;
	
	teza = Math.round(teza*10)/10;
	$("#dodajVitalnoTelesnaVisina").val(visina);
	$("#dodajVitalnoTelesnaTeza").val(teza);
	
	var temp = Math.round((36.2+Math.random())*10)/10;
	
	$("#dodajVitalnoTelesnaTemperatura").val(temp);
	
	var sistolicni = Math.round((110+((Math.random() * 30) + 1))*10)/10;
	var diastolicni = Math.round((60+((Math.random() * 30) + 1))*10)/10;
	var kisik = Math.round((94+((Math.random() * 5) + 1))*10)/10;
	
	$("#dodajVitalnoKrvniTlakSistolicni").val(sistolicni);
	$("#dodajVitalnoKrvniTlakDiastolicni").val(diastolicni);
	$("#dodajVitalnoNasicenostKrviSKisikom").val(kisik);
	$("#dodajVitalnoMerilec").val(merilec);

}

var a = 0;
var ehrIdPrejsnji;


window.onresize = resize;

function resize(){
	
	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	
	
	
	
	var tabela = getTabela();
	
	if(grafi == 0 && ehrId==ehrIdPrejsnji){
		narisiGraf(tabela);
	}
}


function setTabela(tabela){
	zac = tabela;
	
}

function getTabela(){
	return zac;

}




function narisiGraf(tabela){
								
								setTabela(tabela);
								ehrIdPrejsnji= $("#meritveVitalnihZnakovEHRid").val();
								tipPrejsnji = $("#preberiTipZaVitalneZnake").val();
								
								$("svg").remove();
								
								var selection = d3.select("#rezultatMeritveVitalnihZnakov"); 
								a = selection[0][0].clientWidth;
								
								var w = (window.innerWidth / 3)*2;
								
						        var margin = {top: 20, right: 20, bottom: 30, left: 50},
    							width = a - margin.left - margin.right,
							 	height = 500 - margin.top - margin.bottom;

								var parseDate = d3.time.format("%Y-%m-%d").parse;
								
								
								var x = d3.time.scale()
								    .range([0, width]);
								
								var y = d3.scale.linear()
								    .range([height, 0]);
								
								var xAxis = d3.svg.axis()
								    .scale(x)
								    .orient("bottom");
								
								var yAxis = d3.svg.axis()
								    .scale(y)
								    .orient("left");
								
								var line = d3.svg.line()
								    .x(function(d) { return x(d.date); })
								    .y(function(d) { return y(d.close); });
								    
								    
								var line2 = d3.svg.line()
								    .x(function(d) { return x(d.date); })
								    .y(function(d) { return y(d.open); });
								    
								    
								    
								
								var svg = d3.select("#rezultatMeritveVitalnihZnakov").append("svg")
								    .attr("width", width + margin.left + margin.right)
								    .attr("height", height + margin.top + margin.bottom)
								  .append("g")
								    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
								
								
								
								
								
								
								
								
								var data = tabela.map(function(d) {
									 console.log(tabela[0][0]+" "+tabela[0][1]);
									 //tabela[0]=[];
									 var datum = tabela[0][0];
									 console.log(datum);
									 return {
							    	  
							    	  date: parseDate(d[0]),
							    	  close: d[1]
							    	};
							    	//console.log(data.close+" "+data.date);
								});
								
								
								
								var data2 = rezultati.map(function(d) {
									 
									 
									 return {
							    	  
							    	  date: parseDate(d[0]),
							    	  open: d[1]
							    	};
							    	//console.log(data.close+" "+data.date);
								});
								
								
								
								
								
								
								
								
						        
						        
						        console.log(data);
								  
							
								
								  x.domain(d3.extent(data, function(d) { return d.date; }));
								  y.domain(d3.extent(data, function(d) { return d.close; }));
								
								  svg.append("g")
								      .attr("class", "x axis")
								      .attr("transform", "translate(0," + height + ")")
								      .call(xAxis);
								
								  svg.append("g")
								      .attr("class", "y axis")
								      .call(yAxis)
								    .append("text")
								      .attr("transform", "rotate(-90)")
								      .attr("y", 6)
								      .attr("dy", ".71em")
								      .style("text-anchor", "end")
								      .text("Teza (kg)");
								
								  svg.append("path")
								      .datum(data)
								      .attr("class", "line")
								      .attr("d", line);
								
								
								
								svg.append("path")      // Add the valueline2 path.
        							.attr("class", "line")
        							.style("stroke", "red")
        							.attr("d2", line2(data2));
}





function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				
				
				
				
				
				
				
				
				
				
				if (tip == "telesna teža-graf") {
					
					
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		grafi=0;
						    	var tabela=[];
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						            
						           var t=res[i].time;
						           var o=res[i].weight;
						            
						           
						            tabela[i]=[];
						            tabela[i][0]=res[i].time.substring(0,10);
						            tabela[i][1]=res[i].weight;
						            console.log(tabela[i][0]+" "+tabela[i][1]); 
						            
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
						        
						        narisiGraf(tabela);
						        
						        
						        
						     
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    		setTabela(tabela);
					    		grafi=1;
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
				
				
				
				
				
				
				
				} else if (tip == "najmanjsa telesna teza") {
						
					var AQL =	"select " +
					        	"t_a/data[at0002]/events[at0003]/time/value as cas, " +
					    		"t_b/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as diaTlak, " +                                         
					    	    "t_b/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as sisTlak, " +
							    "t_c/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as velikost, " +
					    	    "t_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as masa " +
								"from EHR e[ehr_id/value='"+ehrId+"']" +
								"contains COMPOSITION t " +
								"contains ( " +
						    	  "OBSERVATION t_d[openEHR-EHR-OBSERVATION.body_weight.v1] and " +
						    	  "OBSERVATION t_c[openEHR-EHR-OBSERVATION.height.v1] and " +
						    	  "OBSERVATION t_a[openEHR-EHR-OBSERVATION.body_temperature.v1] and " +
						    	  "OBSERVATION t_b[openEHR-EHR-OBSERVATION.blood_pressure.v1]) " +   
						    	  "order by t_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude " +
								"offset 0 limit 10";
			$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'><tr><th>10 najmanjših mas</th><th class='text-right'>Datum</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						          
   						            results += "<tr><td>" + rows[i].masa + "</td><td class='text-right'>" + rows[i].cas + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
						        
						        
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}

					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}



function pokaziPodatke(i){
	
	$("#rezultatMeritveVitalnihZnakov").append(i);
}




$(document).ready(function() {
	$('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});
	$('#preberiPredlogoBolnika').change(function() {
		$("#kreirajSporocilo").html("");
		var podatki = $(this).val().split(",");
		$("#kreirajIme").val(podatki[0]);
		$("#kreirajPriimek").val(podatki[1]);
		$("#kreirajDatumRojstva").val(podatki[2]);
	});
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
		$("#dodajVitalnoMerilec").val(podatki[8]);
	});
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		
		var pod = $(this).val().split(",");
		
		$("#meritveVitalnihZnakovEHRid").val(pod[0]);
		$("#meritveVitalnihZnakovIme").val(pod[1]);
		$("#meritveVitalnihZnakovPriimek").val(pod[2]);
		$("#meritveVitalnihZnakovDatum").val(pod[3]);
	});
});