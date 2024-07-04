<template>
    <div class="main" :style="{ 'height': cHeight + 'px' }">
      <div class="model" id="domId"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: "GISScene",
    data() {
      return {
        cHeight: null,
        viewer: null,
        app: null,
        uiMng: null,
        mainToolbar: null,
        toolbar: null,
        layerMng: null,
        extLayer: null,
        layerId: '2154800498944640',
        viewToken: 'ce182fbfb2764f2291ad01aba360aa90',
        isColorOverrided: false,
        isWaterAdded: false,
        waterEffect: null,
        isGlowEffectAdded: false,
        isFlyCurveAdded: false,
        flyCurve: null,
        flyCurveIds: [],
        path: [],
        flyCurvePoints: [],
        iscurveAnimationAdded: false,
        isCurveAdded: false,
        curveAnimation: null,
        isWallEffectAdded: false,
        wallEffect: null,
        planeScanEffect: null,
        material: null,
        isPlaneScanEffectAdded: false,
        isRingScanEffectAdded: false,
        ringScanEffect: null,
        isFanScanEffectAdded: false,
        fanScanEffect: null
      };
    },
    mounted() {
      this.cHeight = document.documentElement.clientHeight
      this.loadBimfaceSDK();
    },
    methods: {
      loadBimfaceSDK() {
        const script = document.createElement("script");
        script.src = "https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js";
        script.onload = this.onSDKLoaded;
        document.head.appendChild(script);
      },
      onSDKLoaded() {
        const BimfaceLoaderConfig = new BimfaceSDKLoaderConfig();
        BimfaceLoaderConfig.viewToken = this.viewToken;
        BimfaceSDKLoader.load(BimfaceLoaderConfig, this.onSDKLoadSucceeded, this.onSDKLoadFailed);
      },
      onSDKLoadSucceeded(viewMetaData) {
        const dom4Show = document.getElementById('domId');
        const webAppConfig = new Glodon.Bimface.Application.WebApplicationGISConfig();
        webAppConfig.domElement = dom4Show;
        this.app = new Glodon.Bimface.Application.WebApplicationGIS(webAppConfig);
        this.viewer = this.app.getViewer();
        this.viewer.addScene(this.viewToken);
  
        this.viewer.addEventListener(Glodon.Bimface.Viewer.ViewerGISEvent.SceneAdded, () => {
          this.layerMng = this.viewer.getLayerManager();
          this.uiMng = this.app.getUIManager();
          this.mainToolbar = this.uiMng.getToolbar('MainToolbar');
          this.initSkyBox();
          this.setMapStyle();
          this.addToolbar();
  
          this.extLayer = new Glodon.Bimface.Layer.ExternalObjectLayer({
            name: "飞线",
            id: 'extLayerId',
            isVisible: true
          });
          this.layerMng.addLayer(this.extLayer);
        });
  
        this.viewer.addEventListener(Glodon.Bimface.Viewer.ViewerGISEvent.LayerAdded, (data) => {
          if (data.layerId === this.layerId) {
            this.overrideColor();
          }
        });

        this.viewer.addEventListener(Glodon.Bimface.Viewer.ViewerGISEvent.MouseClickedWithoutMap,(data) =>
        {
          if (data.elementId != "10007"){
            console.log(data);
            window.location.href = "/building";
          }
        });
      },
      onSDKLoadFailed(error) {
        console.log(error);
      },
      addToolbar() {
        this.toolbar = new Glodon.Bimface.Tiles.UI.Toolbar({
          id: 'toolbar',
          isHorizontal: true,
          controlAlign: Glodon.Bimface.Tiles.UI.ControlAlignOption.Center
        });
  
        this.toolbar.addControl(this.createButton('能耗显示', '能耗显示', this.toggleGlowEffect));
  
        this.uiMng.addControl(this.toolbar, {
          position: {
            anchor: Glodon.Bimface.Tiles.UI.ControlAnchor.BottomCenter,
            offset: { x: 0, y: -20 }
          }
        });
      },
      createButton(text, tooltip, onClick) {
        const button = new Glodon.Bimface.Tiles.UI.Button({ id: `btn_${text}` });
        button.setText(text);
        button.setTooltip(tooltip);
        button.onClick(onClick);
        return button;
      },
      toggleGlowEffect() {
        this.toolbar.getControl({ id: 'btn_能耗显示' }).setText(this.isGlowEffectAdded ? '能耗显示' : '关闭能耗显示')
        if (this.isGlowEffectAdded) {
          this.layerMng.getLayer(this.layerId).getComponentManager().clearGlowEffect();
          this.viewer.enableGlowEffect(false);
        } else {
          this.viewer.enableGlowEffect(true);
          this.layerMng.getLayer(this.layerId).getComponentManager().setGlowEffectById(["10026", "10039", "10040", "10041", "10042", "10046", "10047", "10048", "10049"], { type: "body", color: new Glodon.Web.Graphics.Color(50, 211, 166, 1), intensity: 0.6, spread: 3 });
          this.layerMng.getLayer(this.layerId).getComponentManager().setGlowEffectById(["10023", "10035", "10045", "10051", "10056"], { type: "body", color: new Glodon.Web.Graphics.Color(255, 229, 89, 1), intensity: 0.6, spread: 3 });
          this.layerMng.getLayer(this.layerId).getComponentManager().setGlowEffectById(["10053", "10054", "10055"], { type: "outline", color: new Glodon.Web.Graphics.Color(255, 255, 160, 1), intensity: 0.3, spread: 3 });
        }
        this.isGlowEffectAdded = !this.isGlowEffectAdded;
      },
      initMat() {
        const materialConfig = new Glodon.Bimface.Plugins.Material.MaterialConfig();
        materialConfig.viewer = this.viewer;
        materialConfig.src = "https://static.bimface.com/attach/3e8cedfed7a04c8e9cb115ce192e209f_big.png";
        return new Glodon.Bimface.Plugins.Material.Material(materialConfig);
      },
      overrideColor() {
        this.layerMng.getLayer(this.layerId).getComponentManager().overrideColor({ all: true }, new Glodon.Web.Graphics.Color(200, 200, 200, 0.6));
        this.layerMng.getLayer(this.layerId).getComponentManager().overrideColor({ ids: ["10003", "10004", "10005", "10008", "10011"] }, new Glodon.Web.Graphics.Color(131, 206, 208, 0.4));
        this.viewer.render();
      },
      initSkyBox() {
        const skyBoxManagerConfig = new Glodon.Bimface.Plugins.SkyBox.SkyBoxManagerConfig();
        skyBoxManagerConfig.viewer = this.viewer;
        skyBoxManagerConfig.style = Glodon.Bimface.Plugins.SkyBox.SkyBoxStyle.DarkNight;
        new Glodon.Bimface.Plugins.SkyBox.SkyBoxManager(skyBoxManagerConfig);
      },
      setMapStyle() {
        const baseMap = this.layerMng.getLayer('1');
        const color = new Glodon.Web.Graphics.Color(0, 255, 255, 1);
        baseMap.setStyle({
          "template": Glodon.Bimface.Common.ImageStyle.CustomColor,
          "color": color,
          "brightness": 0.5,
          "saturation": -0.4,
        });
      }
    }
  };
  </script>
  
  <style scoped>
  * {
    margin: 0;
    padding: 0;
  }
  
  html,
  body {
    height: 100%;
  }
  
  .main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }
  
  .model {
    height: 100%;
  }
  </style>
  