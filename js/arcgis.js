require(["esri/views/MapView", "esri/WebMap"], function (MapView, WebMap) {

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
});