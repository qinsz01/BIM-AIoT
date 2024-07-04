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
  
        this.toolbar.addControl(this.createButton('水面效果', '水面效果', this.toggleWaterEffect));
        this.toolbar.addControl(this.createButton('发光效果', '发光效果', this.toggleGlowEffect));
        this.toolbar.addControl(this.createButton('飞线动画', '飞线动画', this.toggleFlyCurveAnimation));
        this.toolbar.addControl(this.createButton('电子围墙', '电子围墙', this.toggleWallEffect));
        this.toolbar.addControl(this.createButton('平面扫描', '平面扫描', this.togglePlaneScanEffect));
        this.toolbar.addControl(this.createButton('环状扫描', '环状扫描', this.toggleRingScan));
        this.toolbar.addControl(this.createButton('扇形扫描', '扇形扫描', this.toggleFanScan));
  
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
      toggleWaterEffect() {
        if (this.isWaterAdded) {
          this.waterEffect.destroy();
          this.layerMng.getLayer(this.layerId).getComponentManager().overrideColor({ ids: ["10063"] }, new Glodon.Web.Graphics.Color(200, 200, 200, 0.55));
        } else {
          const waterIds = [{ layerId: this.layerId, objectIds: ['10063'] }];
          const waterEffectConfig = new Glodon.Bimface.Plugins.Animation.WaterEffectConfig();
          waterEffectConfig.ids = waterIds;
          waterEffectConfig.viewer = this.viewer;
          waterEffectConfig.flow = true;
  
          this.waterEffect = new Glodon.Bimface.Plugins.Animation.WaterEffect(waterEffectConfig);
          this.waterEffect.setColor(new Glodon.Web.Graphics.Color(18, 30, 41, 1));
          this.waterEffect.setScale(2);
          this.waterEffect.setXDirection(0.2);
          this.waterEffect.setYDirection(2);
        }
        this.isWaterAdded = !this.isWaterAdded;
      },
      toggleGlowEffect() {
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
      toggleFlyCurveAnimation() {
        if (!this.isCurveAdded) {
          this.addFlyCurve();
          const curveAnimationConfig = new Glodon.Bimface.Plugins.Animation.CurveAnimationConfig();
          curveAnimationConfig.viewer = this.viewer;
          curveAnimationConfig.curves = this.path;
          curveAnimationConfig.time = 2000;
          curveAnimationConfig.loop = true;
          curveAnimationConfig.type = "flow";
          this.curveAnimation = new Glodon.Bimface.Plugins.Animation.CurveAnimation(curveAnimationConfig);
          this.isCurveAdded = true;
        }
        if (!this.iscurveAnimationAdded) {
          this.curveAnimation.play();
        } else {
          this.curveAnimation.stop();
        }
        this.iscurveAnimationAdded = !this.iscurveAnimationAdded;
      },
      addFlyCurve() {
        const extObjMng = this.extLayer.getExternalObjectManager();
        if (!this.isFlyCurveAdded) {
          const centerPoint = { "x": -1009, "y": -1054, "z": 128 };
          const targetPoints = [
            { "x": -1486, "y": -1782, "z": 174 },
            { "x": -1763, "y": -995, "z": 189 },
            { "x": -1030, "y": -557, "z": 105 },
            { "x": -259, "y": -1078, "z": 120 },
            { "x": -929, "y": -1658, "z": 83 }
          ];
          for (let i = 0; i < targetPoints.length; i++) {
            this.flyCurvePoints.push([centerPoint, targetPoints[i]]);
          }
  
          const color = new Glodon.Web.Graphics.Color(255, 237, 141, 1.0);
          const width = 8;
          const style = { "lineType": "Continuous", "lineStyle": null };
  
          let count = 0;
          for (let i = 0; i < this.flyCurvePoints.length; i++) {
            this.flyCurve = new Glodon.Bimface.Plugins.Geometry.SplineCurve(this.flyCurvePoints[i], color, width, style);
            this.path.push(this.flyCurve);
            this.flyCurve.stretch(0.8, 0.5);
            this.flyCurve.setWidthType("ActualWidth");
            this.flyCurve.setWidth(15);
            this.flyCurve.setMap(
              { src: "https://static.bimface.com/attach/f4b5c5e71fce4090a63fc1c2e3839bd2_dynamic(1).png", enableColorOverride: true },
              () => {
                const flyCurveName = "flyCurve" + count;
                extObjMng.loadObject({ name: flyCurveName, object: this.path[count] });
                const flyCurveId = extObjMng.getObjectIdByName(flyCurveName);
                this.flyCurveIds.push(flyCurveId);
                count++;
              }
            );
          }
        } else {
          for (let i = 0; i < this.flyCurveIds.length; i++) {
            extObjMng.removeById(this.flyCurveIds[i]);
          }
          this.flyCurveIds = [];
        }
        this.isFlyCurveAdded = !this.isFlyCurveAdded;
      },
      toggleWallEffect() {
        if (!this.isWallEffectAdded) {
          const wallEffectConfig = new Glodon.Bimface.Plugins.Animation.WallEffectConfig();
          wallEffectConfig.viewer = this.viewer;
          wallEffectConfig.direction = { type: "Tangent", reverse: false };
          wallEffectConfig.duration = 2500;
          wallEffectConfig.height = 80;
          wallEffectConfig.stretch = true;
          wallEffectConfig.material = this.initMat();
          wallEffectConfig.path = [
            { "x": -814.1, "y": -1219.5, "z": 0 },
            { "x": -323.6, "y": -972.7, "z": 0 },
            { "x": 326.5, "y": -1655.6, "z": 0 },
            { "x": 749, "y": -2172.3, "z": 0 },
            { "x": 505, "y": -2292.8, "z": 0 },
            { "x": 365, "y": -2325.2, "z": 0 },
            { "x": -101.9, "y": -2202.1, "z": 0 },
            { "x": -517.7, "y": -2235.5, "z": 0 },
            { "x": -723.7, "y": -1729, "z": 0 },
            { "x": -814.1, "y": -1219.5, "z": 0 }
          ];
          wallEffectConfig.color = new Glodon.Web.Graphics.Color(252, 29, 29, 0.8);
          this.wallEffect = new Glodon.Bimface.Plugins.Animation.WallEffect(wallEffectConfig);
        } else {
          this.wallEffect.destroy();
        }
        this.isWallEffectAdded = !this.isWallEffectAdded;
      },
      togglePlaneScanEffect() {
        if (!this.isPlaneScanEffectAdded) {
          this.material = this.initMat();
          const planeScanEffectConfig = new Glodon.Bimface.Plugins.Animation.PlaneScanEffectConfig();
          planeScanEffectConfig.viewer = this.viewer;
          planeScanEffectConfig.direction = { x: 0.6, y: 0.8, z: 0 };
          planeScanEffectConfig.duration = 3000;
          planeScanEffectConfig.boundary = [
            { "x": -814.1, "y": -1219.5, "z": 0 },
            { "x": -323.6, "y": -972.7, "z": 0 },
            { "x": 326.5, "y": -1655.6, "z": 0 },
            { "x": 749, "y": -2172.3, "z": 0 },
            { "x": 505, "y": -2292.8, "z": 0 },
            { "x": 365, "y": -2325.2, "z": 0 },
            { "x": -101.9, "y": -2202.1, "z": 0 },
            { "x": -517.7, "y": -2235.5, "z": 0 },
            { "x": -723.7, "y": -1729, "z": 0 },
            { "x": -814.1, "y": -1219.5, "z": 0 }
          ];
          planeScanEffectConfig.color = new Glodon.Web.Graphics.Color(252, 29, 29, 0.8);
          planeScanEffectConfig.material = this.material;
          planeScanEffectConfig.blendingRatio = 0.3;
          this.planeScanEffect = new Glodon.Bimface.Plugins.Animation.PlaneScanEffect(planeScanEffectConfig);
        } else {
          this.planeScanEffect.destroy();
        }
        this.isPlaneScanEffectAdded = !this.isPlaneScanEffectAdded;
      },
      initMat() {
        const materialConfig = new Glodon.Bimface.Plugins.Material.MaterialConfig();
        materialConfig.viewer = this.viewer;
        materialConfig.src = "https://static.bimface.com/attach/3e8cedfed7a04c8e9cb115ce192e209f_big.png";
        return new Glodon.Bimface.Plugins.Material.Material(materialConfig);
      },
      toggleRingScan() {
        if (!this.isRingScanEffectAdded) {
          const ringScanEffectConfig = new Glodon.Bimface.Plugins.Animation.RingScanEffectConfig();
          ringScanEffectConfig.viewer = this.viewer;
          ringScanEffectConfig.color = new Glodon.Web.Graphics.Color(252, 29, 29, 1);
          ringScanEffectConfig.duration = 2000;
          ringScanEffectConfig.originPosition = { x: 423, y: -221, z: 5 };
          ringScanEffectConfig.radius = 250;
          ringScanEffectConfig.progressive = 5;
          this.ringScanEffect = new Glodon.Bimface.Plugins.Animation.RingScanEffect(ringScanEffectConfig);
        } else {
          this.ringScanEffect.destroy();
        }
        this.isRingScanEffectAdded = !this.isRingScanEffectAdded;
      },
      toggleFanScan() {
        if (!this.isFanScanEffectAdded) {
          const fanScanEffectConfig = new Glodon.Bimface.Plugins.Animation.FanScanEffectConfig();
          fanScanEffectConfig.viewer = this.viewer;
          fanScanEffectConfig.backgroundColor = new Glodon.Web.Graphics.Color(0, 0, 0, 0.05);
          fanScanEffectConfig.color = new Glodon.Web.Graphics.Color(252, 29, 29, 0.8);
          fanScanEffectConfig.duration = 2000;
          fanScanEffectConfig.fanAngle = Math.PI;
          fanScanEffectConfig.originPosition = { x: -1008, y: -1057, z: 1 };
          fanScanEffectConfig.radius = 250;
          this.fanScanEffect = new Glodon.Bimface.Plugins.Animation.FanScanEffect(fanScanEffectConfig);
        } else {
          this.fanScanEffect.destroy();
        }
        this.isFanScanEffectAdded = !this.isFanScanEffectAdded;
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
  