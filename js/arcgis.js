require(["esri/views/MapView", "esri/WebMap", "esri/widgets/Editor", "esri/widgets/LayerList", "esri/widgets/Legend"], function (MapView, WebMap, Editor, LayerList, Legend) {

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
            container: "layer-list-tool"
        });

        var legend = new Legend({
            view: view,
            container: "legend-tool"
        });


    });
});