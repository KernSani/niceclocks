var niceclocksReady = false;

var ncattr = {
	clockStyle : "analog",		/* Define the clock style: 'analog' or 'digital' */
	clockCircle: "white",       /* outer Circle of the Clock */
    clockHours: "white",        /* strokes of the hours */
    clockSeconds: "white",      /* strokes of the seconds */     
    hourHand: "white",          /* Stundenzeiger */
    minuteHand: "white",         /* MinutenZeiger */
    secondHand:"white",        /* Sekundenzeiger */
    visCircle: "inline",        /* shows outer circle */
    visHours: "inline",         /* shows lines of the hours */
    visSeconds: "inline",       /* shows lines of the seconds */ 
    visHourHand: "inline",      /* Sichtbarkeit des Stundenzeigers */
    visMinuteHand: "inline",    /* Sichtbarkeit des MinutenZeigers */
    visSecondHand: "inline",    /* Sichtbarkeit des Sekundenzeigers */
    
analogBorder: false,		/* draw a border around clock */
	fixMenu : true,				/* Set to "true" to fix the menu (only content scrollable) */
	keepBg : true,				/* Keep the background image (if you have your own) */
	keepHeader : false,			/* Set to "false" if you don't have a command field */
	verbose: 3					
 }


/* Clock functions taken from joncom.be and adjusted by FHEM-Forum user KernSani */
function getDatum() {
var jetzt = new Date();
var TagInWoche = jetzt.getDay();
var Wochentag = new Array("Sonntag", "Montag", "Dienstag", "Mittwoch",
                          "Donnerstag", "Freitag", "Samstag");
var Jahresmonat = jetzt.getMonth();
var Monat = new Array("Januar", "Februar", "M&auml;rz", "April", "Mai", "Juni",
                      "Juli", "August", "September", "Oktober", "November", "Dezember");						  
var out = "<p>"+Wochentag[TagInWoche]+", </p><p>"+jetzt.getDate()+". "+Monat[Jahresmonat]+" "+jetzt.getFullYear()+"</p>";
return out;
}
function initAnalog() {



return oClockAnalog = {
    aSecond:         [],
    dtDate:          new Date(),
    iCurrSecond:     -1,
    iHourRotation:   -1,
    iMinuteRotation: -1,
    iStepSize:       10,
    iTimerAnimate:   setInterval("oClockAnalog.fAnimate()", 20),
    iTimerUpdate:    setInterval("oClockAnalog.fUpdate()", 1000),

    fAnimate:       function() {
        if (this.aSecond.length > 0) {
            this.fRotate("analogsecond", this.aSecond[0]);
            this.aSecond = this.aSecond.slice(1);
        }
    },
    fGetHour:     function() {
        var iHours = this.dtDate.getHours();
        if (iHours > 11) {
            iHours -= 12;
        }
        return Math.round((this.dtDate.getHours() * 30) + (this.dtDate.getMinutes() / 2) + (this.dtDate.getSeconds() / 120));
    },
    fGetMinute:     function() {
        return Math.round((this.dtDate.getMinutes() * 6) + (this.dtDate.getSeconds() / 10));
    },
    fInit:          function() {
        this.iHourRotation = this.fGetHour();
        this.fRotate("analoghour", this.iHourRotation);

        this.iMinuteRotation = this.fGetMinute();
        this.fRotate("analogminute", this.iMinuteRotation);

        this.iCurrSecond = this.dtDate.getSeconds();
        this.fRotate("analogsecond", (6 * this.iCurrSecond));
    },
    fRotate:        function(sID, iDeg) {
        var sCSS = ("rotate(" + iDeg + "deg)");
        /*document.getElementById(sID).css({ '-moz-transform': sCSS, '-o-transform': sCSS, '-webkit-transform': sCSS });*/
		document.getElementById(sID).style.transform=sCSS;
		document.getElementById(sID).style.webkitTransform=sCSS;
    },
    fStepSize:     function(iTo, iFrom) {
        var iAnimDiff = (iFrom - iTo);
        if (iAnimDiff > 0) {
            iAnimDiff -= 360;
        }
        return iAnimDiff / this.iStepSize;
    },
    fUpdate:        function() {
        // update time
        this.dtDate = new Date();

        // hours
        var iTemp = this.fGetHour();
        if (this.iHourRotation != iTemp) {
            this.iHourRotation = iTemp;
            this.fRotate("analoghour", iTemp);
        }

        // minutes
        iTemp = this.fGetMinute();
        if (this.iMinuteRotation != iTemp) {
            this.iMinuteRotation = iTemp;
            this.fRotate("analogminute", iTemp);
        }

        // seconds
        if (this.iCurrSecond != this.dtDate.getSeconds()) {
            var iRotateFrom = (6 * this.iCurrSecond);
            this.iCurrSecond = this.dtDate.getSeconds();
            var iRotateTo = (6 * this.iCurrSecond);

            // push steps into array
            var iDiff = this.fStepSize(iRotateTo, iRotateFrom);
            for (var i = 0; i < this.iStepSize; i++) {
                iRotateFrom -= iDiff;
                this.aSecond.push(Math.round(iRotateFrom));
            }
        }
    }
};
};
function initDigital() {
return oClockDigital = {
    aHour:          [],
    aMinute:        [],
    aSecond:        [],
    dtDate:         new Date(),
    iCurrHour:      -1,
    iCurrMinute:    -1,
    iCurrSecond:    -1,
    iStepSize:      10,
    iTimerAnimate:  setInterval("oClockDigital.fAnimate()", 20),
    iTimerUpdate:   setInterval("oClockDigital.fUpdate()", 1000),

    fAnimate:       function() {
        if (this.aHour.length > 0) {
            this.fRotate("digitalhour", this.aHour[0]);
            this.aHour = this.aHour.slice(1);
        }
        if (this.aMinute.length > 0) {
            this.fRotate("digitalminute", this.aMinute[0]);
            this.aMinute = this.aMinute.slice(1);
        }
        if (this.aSecond.length > 0) {
            this.fRotate("digitalsecond", this.aSecond[0]);
            this.aSecond = this.aSecond.slice(1);
        }
    },
    fInit:          function() {
        this.iCurrHour = this.dtDate.getHours();
        this.iCurrMinute = this.dtDate.getMinutes();
        this.iCurrSecond = this.dtDate.getSeconds();
        this.fRotate("digitalhour", (360 - (15 * this.iCurrHour)));
        this.fRotate("digitalminute", (360 - (6 * this.iCurrMinute)));
        this.fRotate("digitalsecond", (360 - (6 * this.iCurrSecond)));

        document.getElementById("clockdigital").style.transition="opacity 0.5 ease-in-out";
		
    },
    fRotate:        function(sID, iDeg) {
        var sCSS = ("rotate(" + iDeg + "deg)");
        /* document.getElementById(sID).css({ 'transform': sCSS, '-moz-transform': sCSS, '-o-transform': sCSS, '-webkit-transform': sCSS });*/
		document.getElementById(sID).style.transform=sCSS;
    },
    fStepSize:     function(iTo, iFrom) {
        var iAnimDiff = (iTo - iFrom);
        if (iAnimDiff > 0) {
            iAnimDiff -= 360;
        }
        return iAnimDiff / this.iStepSize;
    },
    fUpdate:        function() {
        // update time
        this.dtDate = new Date();

        // hours
        if (this.iCurrHour != this.dtDate.getHours()) {
            var iRotateFrom = (360 - (15 * this.iCurrHour));
            this.iCurrHour = this.dtDate.getHours();
            var iRotateTo = (360 - (15 * this.iCurrHour));

            // push steps into array
            var iDiff = this.fStepSize(iRotateTo, iRotateFrom);
            for (var i = 0; i < this.iStepSize; i++) {
                iRotateFrom += iDiff;
                this.aHour.push(Math.round(iRotateFrom));
            }
        }

        // minutes
        if (this.iCurrMinute != this.dtDate.getMinutes()) {
            var iRotateFrom = (360 - (6 * this.iCurrMinute));
            this.iCurrMinute = this.dtDate.getMinutes();
            var iRotateTo = (360 - (6 * this.iCurrMinute));

            // push steps into array
            var iDiff = this.fStepSize(iRotateTo, iRotateFrom);
            for (var i = 0; i < this.iStepSize; i++) {
                iRotateFrom += iDiff;
                this.aMinute.push(Math.round(iRotateFrom));
            }
        }

        // seconds
        if (this.iCurrSecond != this.dtDate.getSeconds()) {
            var iRotateFrom = (360 - (6 * this.iCurrSecond));
            this.iCurrSecond = this.dtDate.getSeconds();
            var iRotateTo = (360 - (6 * this.iCurrSecond));

            // push steps into array
            var iDiff = this.fStepSize(iRotateTo, iRotateFrom);
            for (var i = 0; i < this.iStepSize; i++) {
                iRotateFrom += iDiff;
                this.aSecond.push(Math.round(iRotateFrom));
            }
        }
    }
};
};


// quick fix for f18_resize   
function ncf18_resize() {
	hdr.style.left="164px";
}

function clockInit(clockType) {
/* Adjust Styles */
var logo = document.getElementById('logo');

       

if(!ncattr['keepBg']) {
	document.body.style.backgroundImage="none";
}


if(ncattr['fixMenu']) {
	document.getElementById('menu').style.position="fixed";
	logo.style.position="fixed";
}

if (!ncattr['keepHeader']) {
	if (document.getElementById('content')) {		//fix for Floorplan
		document.getElementById('content').style.top="5px";
	}
}

logo.style.top="20px";
logo.style.fontSize="xx-large";
logo.style.textAlign="center";
logo.style.fontWeight="bold";
logo.style.left="31px";
logo.style.width="120px";
logo.style.height = "200px";
logo.style.backgroundImage="none";
logo.style.visibility="visible";

// fixes for f18 style 
if(typeof f18_sd !=="undefined") {
	$(window).resize(ncf18_resize);	
	if (!f18_attr["Pinned.menu"]) {
		logo.style.display="none";
		logo.style.height = "0px";
	}
	else {
		
		$("#hdr").css("left", (parseInt($("div#menu").width())+20)+"px");
		var w=$(window).width();
		var diff = 0;
		diff += parseInt($("div#menu").width())+20;
		$("input.maininput").css("width", (w-(FW_isiOS ? 40 : 30)-diff)+'px');
	}
}
	

if(clockType!="digital") {
	document.getElementById('logo').innerHTML='<div id="clockanalog"><div id="analogsecond"></div><div id="analogminute" ></div><div id="analoghour"></div></div><div id="ncDate">'+getDatum()+'</div>';

 

/*$.ajax({
	url:'http://192.168.1.133:8083/fhem/niceclocks/images/analoghours.svg',
	async:true, 
	documentType:'xml',
	type:'POST',
	success:function(data) {
		temp = document.createElement('div');
		var child;
		for (child in data.documentElement.childNodes) {
			temp.appendChild(child);}
		
		svg = '<svg \
			xmlns:dc="http://purl.org/dc/elements/1.1/"\
			xmlns:cc="http://creativecommons.org/ns#"\
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
			xmlns:svg="http://www.w3.org/2000/svg"\
			xmlns="http://www.w3.org/2000/svg"\
			version="1.1"\
			width="120"\
			height="120"\
			viewBox="0 0 120 120"\
			id="svg4315">'+temp+'</svg>';
	    document.getElementById("analoghour").innerHTML += svg;
        document.getElementById('layer6').style.fill=ncattr['hourHand'];
	    document.getElementById('layer6').style.display=ncattr['visHourHand'];
	}
}); 
*/
$.get(FW_root+'/niceclocks/images/analoghours.svg', function(data) {
svg = '<svg \
			xmlns:dc="http://purl.org/dc/elements/1.1/"\
			xmlns:cc="http://creativecommons.org/ns#"\
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
			xmlns:svg="http://www.w3.org/2000/svg"\
			xmlns="http://www.w3.org/2000/svg"\
			version="1.1"\
			width="120"\
			height="120"\
			viewBox="0 0 120 120"\
			id="svg4315">'+data.documentElement.innerHTML+'</svg>';
	    document.getElementById("analoghour").innerHTML += svg;
        document.getElementById('layer6').style.fill=ncattr['hourHand'];
}); 		
$.get(FW_root+'/niceclocks/images/analogminutes.svg', function(data) {
svg = '<svg \
			xmlns:dc="http://purl.org/dc/elements/1.1/"\
			xmlns:cc="http://creativecommons.org/ns#"\
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
			xmlns:svg="http://www.w3.org/2000/svg"\
			xmlns="http://www.w3.org/2000/svg"\
			version="1.1"\
			width="120"\
			height="120"\
			viewBox="0 0 120 120"\
			id="svg4315">'+data.documentElement.innerHTML+'</svg>';
	        document.getElementById("analogminute").innerHTML += svg;
            document.getElementById('layer5').style.fill=ncattr['minuteHand'];
	        document.getElementById('layer5').style.display=ncattr['visMinuteHand'];

}); 
$.get(FW_root+'/niceclocks/images/analogseconds.svg', function(data) {
svg = '<svg \
			xmlns:dc="http://purl.org/dc/elements/1.1/"\
			xmlns:cc="http://creativecommons.org/ns#"\
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
			xmlns:svg="http://www.w3.org/2000/svg"\
			xmlns="http://www.w3.org/2000/svg"\
			version="1.1"\
			width="120"\
			height="120"\
			viewBox="0 0 120 120"\
			id="svg4315">'+data.documentElement.innerHTML+'</svg>';
	        document.getElementById("analogsecond").innerHTML += svg;
            document.getElementById('layer4').style.fill=ncattr['secondHand'];
	        document.getElementById('layer4').style.display=ncattr['visSecondHand'];

}); 



	
$.get(FW_root+'/niceclocks/images/svg_analog.svg', function(data) {
svg = '<svg \
			xmlns:dc="http://purl.org/dc/elements/1.1/"\
			xmlns:cc="http://creativecommons.org/ns#"\
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
			xmlns:svg="http://www.w3.org/2000/svg"\
			xmlns="http://www.w3.org/2000/svg"\
			version="1.1"\
			width="120"\
			height="120"\
			viewBox="0 0 120 120"\
			id="svg4048">'+data.documentElement.innerHTML+'</svg>';
	        document.getElementById("clockanalog").innerHTML += svg;

        document.getElementById('layer1').style.fill=ncattr['clockCircle'];
        document.getElementById('layer1').style.display=ncattr['visCircle'];
        document.getElementById('layer2').style.fill=ncattr['clockSeconds'];
        document.getElementById('layer2').style.display=ncattr['visSeconds'];
        document.getElementById('layer3').style.fill=ncattr['clockHours'];
        document.getElementById('layer3').style.display=ncattr['visHours'];
                       
});

  
    
	oClockAnalog = initAnalog();
	oClockAnalog.fInit(); 
	document.getElementById('menu').style.top="240px";
	}
else {
	document.getElementById('logo').innerHTML='<div id="clockdigital"><img src="/fhem/niceclocks/images/digitalhours.gif" id="digitalhour"/><img src="/fhem/niceclocks/images/digitalminutes.gif" id="digitalminute"/><img src="/fhem/niceclocks/images/digitalseconds.gif" id="digitalsecond"/><div style="opacity: 0.8;">&nbsp;</div><div style="opacity: 0.8;">&nbsp;</div></div><div id="ncDateD">'+getDatum()+'</div>';	
	oClockDigital = initDigital();
	oClockDigital.fInit(); 
	document.getElementById('menu').style.top="180px";
	}



}

// On Page Refresh, Loading starts here:
$(start_niceclocks);
FW_widgets['niceclocks'] = {
  createFn:start_niceclocks, };


function niceclocklog(level,text) {
   if (level <= ncattr['verbose']) {
     console.log(text);
   }
}
function start_niceclocks() {
	// no niceclock for unpinned menu in f18 style
	if((typeof f18_sd !=="undefined" && f18_attr["Pinned.menu"]) || typeof f18_sd == "undefined") {

		  // Combine User-Attributes with default-Attributes
		  var userAttr = scriptAttribute("fhem_niceclocks.js");
		  for(var attribute in userAttr) {ncattr[attribute] = userAttr[attribute];}
		   
		  niceclocksReady = true;      
		  niceclocklog(3,"niceclocks: Ready. Processing Clock.");
		  clockInit(ncattr["clockStyle"]);
	}
}

