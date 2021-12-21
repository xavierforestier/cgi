//Version 1.0 21/12/21
var timeout=0;
function toggleFav(conn) {
	const favs = JSON.parse(window.localStorage["fav"] || "[]");
	if(favs.indexOf(conn) < 0) {
		favs.push(conn);
		window.localStorage.setItem("fav", JSON.stringify(favs));
	}
	else {
		window.localStorage.setItem("fav", JSON.stringify(favs.filter(f => f!=conn)));
	}
	clearTimeout(timeout);
	refreshProjet();
}
function setDef(conn) {
	const favs = JSON.parse(window.localStorage["fav"] || "[]");
	window.localStorage.removeItem("auto_connect");
	if (conn) {
		window.localStorage.setItem("auto_connect",conn);
		if(favs.indexOf(conn) < 0) {
			favs.push(conn);
			window.localStorage.setItem("fav", JSON.stringify(favs));
		}
	}
	clearTimeout(timeout);
	refreshProjet();
}
function connect(conn) {
	const ajax=new XMLHttpRequest();
	ajax.onload = function() {
		if( (ajax.readyState === ajax.DONE) && (ajax.status === 200) ) {
			refreshProjet();
		}
	};
	ajax.open('POST', document.location.origin + '/selectProfile/' + conn);
	ajax.send();
}
function refreshProjet(){
	const favs = JSON.parse(window.localStorage["fav"] || "[]");
	const def = window.localStorage["auto_connect"] || "";
	const ajax=new XMLHttpRequest();
	ajax.onload = function() {
		if( (ajax.readyState === ajax.DONE) && (ajax.status === 200) ) {
			const jsonResp = JSON.parse(ajax.responseText);
			var html="<table><tr><th>Connexion</th><th>Etat</th><th>Favoris</th></tr>";
			//Les connexions actives
			jsonResp.filter(conn=> conn.active).forEach(active => { html += "<tr class='text-success'><td>" + active.name + "</td><td>Connect&eacute;</td><td>" + ( active.name==def ?"<button onclick='setDef()' style='font-weight:bold'>":"<button onclick='setDef(\"" +  active.name + "\")'>") + "Auto-connect</button><button onclick='toggleFav(\"" +  active.name + "\")'>" + (favs.indexOf(active.name) < 0 ?"&#9734;":"&#11088;") + "</button></td></tr>" });
			//Les connexions favorites
			jsonResp.filter(conn=> (!conn.active) && (favs.indexOf(conn.name) >= 0 )).forEach(active => { html += "<tr><td>" + active.name + "</td><td><button onclick='connect(\"" + active.name + "\")'>Se connecter</button></td><td>" + ( active.name==def ?"<button onclick='setDef()' style='font-weight:bold'>":"<button onclick='setDef(\"" +  active.name + "\")'>") + "Auto-connect</button><button onclick='toggleFav(\"" +  active.name + "\")'>&#11088;</button></td></tr>" });
			//Le reste
			jsonResp.filter(conn=> (!conn.active) && (favs.indexOf(conn.name) < 0 )).forEach(active => { html += "<tr><td>" + active.name + "</td><td><button onclick='connect(\"" + active.name + "\")'>Se connecter</button></td><td>" + ( active.name==def ?"<button onclick='setDef()' style='font-weight:bold'>":"<button onclick='setDef(\"" +  active.name + "\")'>") + "Auto-connect</button><button onclick='toggleFav(\"" +  active.name + "\")'>&#9734;</button></td></tr>" });
			document.querySelector("div.list-group").innerHTML = html + "</table>";
		}
		timeout=window.setTimeout(refreshProjet, 30000);
	};
	ajax.open('GET', document.location.origin + '/api/v2/cmdb/firewall/addrgrp/');
	ajax.send();
}
//Init
if( window.localStorage["auto_connect"] ) {
	connect( window.localStorage["auto_connect"]);
}
else {
	refreshProjet();
}
