
var Integrations = {
    Services: [
        {
            name: "google",
            hostname: "https://play.google.com"
        },
        {
            name: "spotify",
            hostname: "https://open.spotify.com"
        }
    ]
};

var Transmute = function (url) {

    if (!url) {
        throw "No Url Provided.";
    }

    this.url = url;
    this.preferedServiceUrl = null;
    this.incomingServiceUrl = null;
};

Transmute.prototype.determineIncomingServiceUrl = function() {
    console.log("google service!");
};

Transmute.prototype.parseUrlStringForHost = function() {
    var re = new RegExp("^(?:f|ht)tp(?:s)?\://([^/]+)", "im");

    return(this.url.match(re)[1].toString());
};

Transmute.prototype.setPreferedService = function() {
    // Get this from prefs
    this.preferedService = "spotify";
};

Transmute.prototype.getPreferedServceUrl = function() {
    for (var i = 0; i < Integrations.Services.length; i++) {
        if (Integrations.Services[i].name == this.preferedService) {
            console.log(Integrations.Services[i]);
            this.preferedServiceUrl = Integrations.Services[i].hostname;
        }
    }
};

var url = new Transmute("https://www.open.spotify.com");

url.setPreferedService();
url.determineIncomingServiceUrl();
url.getPreferedServceUrl();

console.log(url);

