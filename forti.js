function toggleFav(conn) {
	const favs = JSON.parse(window.localStorage["fav"] || "[]");
	if(favs.indexOf(conn) < 0) {
		favs.push(conn);
		window.localStorage.setItem("fav", JSON.stringify(favs));
	}
	else {
		window.localStorage.setItem("fav", JSON.stringify(favs.filter(f => f!=conn)));
	}
}
function connect(conn) {
	const ajax=new XMLHttpRequest();
	ajax.onload = function() {
		if( (ajax.readyState === xhr.DONE) && (ajax.status === 200) ) {
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
		if( (ajax.readyState === xhr.DONE) && (ajax.status === 200) ) {
			const jsonResp = JSON.parse(ajax.responseText);
			var html="<table><tr><th>Connexion</th><th>Etat</th><th>Favoris</th></tr>";
			//Les connexions actives
			jsonResp.filter(conn=> conn.active).forEach(active => { html += "<tr><td>" + active.name + "</td><td>Connecté</td><td>" + ( active.name==def ?"<button disabled>Défaut</button>":"<button onclick='window.localStorage.setItem(\"auto_connect\",\"" +  active.name + "\")'>Défaut</button>") + "<button onclick='toggleFav(\"" +  active.name + "\")'>" + (favs.indexOf(active.name) < 0 ?"Fav":"Unfav") + "</button></td></tr>" });
			//Les connexions favorites
			jsonResp.filter(conn=> (!conn.active) && (favs.indexOf(conn.name) >= 0 )).forEach(active => { html += "<tr><td>" + active.name + "</td><td><button onclick='connect(\"" + conn.name + "\")'>Se connecter</button></td><td>" + ( active.name==def ?"<button disabled>Défaut</button>":"<button onclick='window.localStorage.setItem(\"auto_connect\",\"" +  active.name + "\")'>Défaut</button>") + "<button onclick='toggleFav(\"" +  active.name + "\")'>Unfav</button></td></tr>" });
			//Le reste
			jsonResp.filter(conn=> (!conn.active) && (favs.indexOf(conn.name) < 0 )).forEach(active => { html += "<tr><td>" + active.name + "</td><td><button onclick='connect(\"" + conn.name + "\")'>Se connecter</button></td><td>" + ( active.name==def ?"<button disabled>Défaut</button>":"<button onclick='window.localStorage.setItem(\"auto_connect\",\"" +  active.name + "\")'>Défaut</button>") + "<button onclick='toggleFav(\"" +  active.name + "\")'>Fav</button></td></tr>" });
			document.querySelector("div.list-group").innerHTML = html + "</table>";
		}
		window.setTimeout(refreshProjet, 30000);
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
