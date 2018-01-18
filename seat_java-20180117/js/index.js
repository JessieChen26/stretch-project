
var host = 'http://sz-g46l6h2:8080';

var regions;
var regionMapping = {}
var teams;
var teamMapping = {}
getRegions({}, function(data){
	regions = data;
	sort(regions, 'floor', -1);
	var floors = []
	var f = 0;
	var rs = [];
	for(var i in regions){
		var region = regions[i]
		if(f != region.floor){
			rs = [];
			floors.push({
				regions: rs
			});
			f = region.floor;
		}
		rs.push(region);
	}
	for(var i in regions){
		var region = regions[i];
		region.teams = []
		regionMapping[region.id] = region;
	}
	getTeams({}, function(data){
		var teamSeatsMap = {};
		teams = data;
		for(var i in teams){
			var team = teams[i]
			teamMapping[team.id] = team;
		}
		for(var i in teams){
			
			var team = teams[i]
			if(team.assignIn){
				
				var regionId = team.assignIn;
				teamSeatsMap[team.id] = regionId;
				regionMapping[team.assignIn].teams.push(team);
			}
		}
		var renderBuild = doT.template($("#buildTemplate").text());
		$("#build").html(renderBuild(floors));
		var renderUnderground = doT.template($("#undergroundTemplate").text());
		$("#underground").html(renderUnderground(teams));
		drag.init('.body', '.region, .underground', '.team', teamSeatsMap);
	});
});


function sort(list, key, asc){
	var len = list.length;
	for(var i = 0; i < len; i++){
		for(var k = 0; k < len-1-i; k++){
			if((list[k][key] - list[k+1][key]) * asc > 0){
				var t = list[k]
				list[k] = list[k+1]
				list[k+1] = t
			}
		}
	}
}


function getRegions(params, callback){
	$.ajax({ 
		url: host + "/assign/zoneList",
		type:'get',
     	dataType:'json',
		success: function(data){
    		callback && callback(data)
	  	},
	  	error: function(error){
	  		alert(error)
	  	}
	 });
}

function getTeams(params, callback){
	$.ajax({ 
		url: host + "/assign/teamList",
		type:'get',
     	dataType:'json',
		success: function(data){
    		callback && callback(data)
	  	},
	  	error: function(error){
	  		alert(error)
	  	}
	 });
}

function autoAssign(teamAssignData, callback){
	$.ajax({ 
		url: host + "/assign/autoAssign",
		type:'post',
		data: teamAssignData,
     	dataType:'json',
		success: function(data){
    		callback && callback(data)
	  	},
	  	error: function(error){
	  		alert(error)
	  	}
	 });
}

function assignSeats() {
	var currentAssign = drag.teamSeatsMap;
	var teamAssignData = 'teamAssignData=' + JSON.stringify(currentAssign);
	
	autoAssign(teamAssignData, function(data){
		var message = data.message;
		if (data.status === "ERROR") {
			alert(message);
			return;
		}
		teams = data.data;
		for(var i in teams){
			var zoneId = teams[i];
			var teamId = "team" + i;
			var teamDom = $("body").find("#team" + i);
			var regionDom = $("body").find("#region" + zoneId);
			regionDom.append(teamDom);
		}
		drag.teamSeatsMap = data.data;
	});
}

function refreshPage() {
	window.location.reload();
}