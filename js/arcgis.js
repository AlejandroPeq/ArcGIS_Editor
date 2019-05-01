require(["esri/views/MapView", "esri/WebMap", "esri/layers/FeatureLayer", "esri/widgets/Editor", "esri/widgets/LayerList", "esri/widgets/Legend", "esri/portal/Portal", "esri/identity/OAuthInfo", "esri/identity/IdentityManager", "esri/portal/PortalQueryParams"], function (MapView, WebMap, FeatureLayer, Editor, LayerList, Legend, Portal, OAuthInfo, esriId, PortalQueryParams) {

    var personalPanelElement = document.getElementById("personalizedPanel");
    var anonPanelElement = document.getElementById("anonymousPanel");
    var userIdElement = document.getElementById("userId");

    var info = new OAuthInfo({
        // Swap this ID out with registered application ID
        appId: "6OA92ihmOkJcw5Bo",
        // Uncomment the next line and update if using your own portal
        // portalUrl: "https://<host>:<port>/arcgis"
        // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
        // authNamespace: "portal_oauth_inline",
        popup: false
    });
    esriId.registerOAuthInfos([info]);

    esriId
        .checkSignInStatus(info.portalUrl + "/sharing")
        .then(function () {
            connectPortal();
        })
        .catch(function () {
            // Anonymous view
            // anonPanelElement.style.display = "block";
            personalPanelElement.style.display = "none";
            hideLoader();
        });

    document
        .getElementById("sign-in")
        .addEventListener("click", function () {
            showLoader();
            // user will be redirected to OAuth Sign In page
            esriId.getCredential(info.portalUrl + "/sharing");

        });

    document
        .getElementById("sign-out")
        .addEventListener("click", function () {
            showLoader();
            esriId.destroyCredentials();
            window.location.reload();

        });


    var idWebMap = conf.idWebMap;

    var webmap = new WebMap({
        portalItem: {

            id: idWebMap
        }
    });

    var view = new MapView({
        map: webmap,
        container: "map2d"
    });

    view.when(function () {
        view.popup.autoOpenEnabled = false; //disable popups

        // Create the Editor
        let editor = new Editor({
            view: view,
            container: "editor-tool"
        });

        var layerList = new LayerList({
            view: view,
            container: "layer-list-tool",
            listItemCreatedFunction: defineActions
        });


        var legend = new Legend({
            view: view,
            container: "legend-tool"
        });


        serviceStart(layerList);

    });

    function showLoader() {
        document.getElementById("loader-container").classList.add("is-active");
    }


    function hideLoader() {
        document.getElementById("loader-container").classList.remove("is-active");
    }


    function connectPortal() {
        var portal = new Portal();
        // Setting authMode to immediate signs the user in once loaded
        portal.authMode = "immediate";
        // Once loaded, user is signed in
        portal.load().then(function () {
            // Create query parameters for the portal search
            var queryParams = new PortalQueryParams({
                query: "owner:" + portal.user.username,
                sortField: "modified",
                sortOrder: "desc",
                num: 99
            });

            userIdElement.innerHTML = portal.user.username;
            anonPanelElement.style.display = "none";
            personalPanelElement.style.display = "block";
            hideLoader();

            // Query the items based on the queryParams created from portal above
            portal.queryItems(queryParams).then(createGallery);
        });
    }

    function createGallery(items) {
        var htmlFragment = "";

        items.results.forEach(function (item) {

            if (item.type == "Feature Service") {
                htmlFragment += '<div class="card card-wide"><figure class="card-wide-image-wrap"><img class="card-wide-image" src="' + item.thumbnailUrl + '"></figure><div class="card-content"><p class="trailer-half portal-item-title"><a href="#">' + item.title + '</a></p><p class="portal-item-num-views trailer-quarter">' + item.numViews + '</p></div></div>';
            } else {

            }


        });
        document.getElementById("itemGallery").innerHTML = htmlFragment;
    }

    function serviceStart(layerList) {

        document.getElementById("buttonFeature").onclick = function () {
            service = document.getElementById("inputFeature").value;
            addEditableFeature(service, layerList);
        };

        layerList.on("trigger-action", function (event) {
            // The layer visible in the view at the time of the trigger.
            var visibleLayer = event.item.layer;

            // Capture the action id.
            var id = event.action.id;

            if (id === "full-extent") {
                // if the full-extent action is triggered then navigate
                // to the full extent of the visible layer
                view.goTo(visibleLayer.fullExtent);
            } else if (id === "information") {
                // if the information action is triggered, then
                // open the item details page of the service layer
                window.open(visibleLayer.url);
            } else if (id === "increase-opacity") {
                // if the increase-opacity action is triggered, then
                // increase the opacity of the GroupLayer by 0.25

                if (visibleLayer.opacity < 1) {
                    visibleLayer.opacity += 0.25;
                }
            } else if (id === "decrease-opacity") {
                // if the decrease-opacity action is triggered, then
                // decrease the opacity of the GroupLayer by 0.25

                if (visibleLayer.opacity > 0) {
                    visibleLayer.opacity -= 0.25;
                }
            }
        });

    }

    function defineActions(event) {
        //acciones layerList
        var item = event.item;

        item.actionsSections = [
            [{
                title: " Go to full extent",
                className: "esri-icon-zoom-out-fixed",
                id: "full-extent"
            }],
            [{
                title: " Layer information",
                className: "esri-icon-description",
                id: "information"
            }],
            [{
                title: " Increase opacity",
                className: "esri-icon-up",
                id: "increase-opacity"
            }],
            [{
                title: " Decrease opacity",
                className: "esri-icon-down",
                id: "decrease-opacity"
            }]
        ];

    }


    function addEditableFeature(service, layerList) {

        const layer = new FeatureLayer({
            // URL to the service
            url: service
        });

        if (layer.editingEnabled == true) {
            // test https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Hazards_Uptown_Charlotte/FeatureServer
            webmap.layers.add(layer);

            zoomToLayer(layer);


        } else {
            alert("servicio sin capacidad de edición")
        }


    }


    function zoomToLayer(layer) {
        return layer.queryExtent().then(function (response) {
            view.goTo(response.extent);
        });
    }

});