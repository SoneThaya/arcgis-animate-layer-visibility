import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const MapEl = useRef(null);

  useEffect(() => {
    loadModules([
      "esri/WebMap",
      "esri/views/MapView",
      "esri/widgets/LayerList",
      "esri/core/watchUtils",
    ]).then(([WebMap, MapView, LayerList, watchUtils]) => {
      const map = new WebMap({
        portalItem: {
          id: "6a991f8722dd42628f951ee2e6906ca5",
        },
      });

      const view = new MapView({
        map: map,
        container: "viewDiv",
      });

      const layerList = new LayerList({
        view: view,
      });
      view.ui.add(layerList, "top-right");

      function fadeVisibilityOn(layer) {
        let animating = true;
        let opacity = 0;
        // fade layer's opacity from 0 to
        // whichever value the user has configured
        const finalOpacity = layer.opacity;
        layer.opacity = opacity;

        view.whenLayerView(layer).then((layerView) => {
          function incrementOpacityByFrame() {
            if (opacity >= finalOpacity && animating) {
              animating = false;
              return;
            }

            layer.opacity = opacity;
            opacity += 0.05;

            requestAnimationFrame(incrementOpacityByFrame);
          }

          // Wait for tiles to finish loading before beginning the fade
          watchUtils.whenFalseOnce(layerView, "updating", function (updating) {
            requestAnimationFrame(incrementOpacityByFrame);
          });
        });
      }

      view.when().then(() => {
        // When the user toggles a layer on, transition
        // the layer's visibility using opacity
        layerList.operationalItems.forEach((item) => {
          item.watch("visible", (visible) => {
            if (visible) {
              fadeVisibilityOn(item.layer);
            }
          });
        });
      });
    });
  }, []);

  return (
    <div
      id="viewDiv"
      style={{ height: "100vh", width: "100vw" }}
      ref={MapEl}
    ></div>
  );
};

export default Map;
