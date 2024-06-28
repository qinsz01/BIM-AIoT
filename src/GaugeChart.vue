<template>
    <div ref="gaugeChart" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import * as echarts from 'echarts';
import { watch, toRef, defineProps, onMounted } from 'vue';

const gaugeChart = toRef(null);

const room_dict = {
    "co": {
        "name": "CO2",
        "unit": "ppm",
        "max": 1000,
        "min": 0
    },
    "pm25": {
        "name": "PM2.5",
        "unit": "ug/m3",
        "max": 100,
        "min": 0
    },
    "t": {
        "name": "温度",
        "unit": "℃",
        "max": 100,
        "min": 0
    },
    "h": {
        "name": "湿度",
        "unit": "%",
        "max": 100,
        "min": 0
    },
    "light": {
        "name": "光照",
        "unit": "lux",
        "max": 100,
        "min": 0
    }
}


function initChart() {
    const chart = echarts.init(gaugeChart.value);
    // const props_refs=toRefs(props);
    // console.log(props_refs);
    const option = {
        series: [
            {
                type: 'gauge',
                radius: '60%',
                max: room_dict[props.typeName].max,
                min: room_dict[props.typeName].min,
                progress: {
                    show: true,
                    width: 18,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: "#14517C"
                                },
                                {
                                    offset: 1,
                                    color: "#2e1256"
                                }
                            ],
                        },
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        shadowBlur: 3,
                        shadowColor: '#000000',
                        // color: "#fff",
                        color: [
                            [1, new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                                {
                                    offset: 0,
                                    color: "#c6efe8"
                                },
                                // {
                                //     offset: 1,
                                //     color: "#2f7fc1"
                                // }
                            ], false)]
                        ]
                    },
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                pointer: {
                    width: 2,
                    length: '50%',
                },
                title: {
                    show: true,
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: '#8983bf',
                    offsetCenter: [0, '-140%'],
                },
                detail: {
                    valueAnimation: false,
                    fontSize: 15,
                    fontWeight: 'bold',
                    offsetCenter: [0, '80%'],
                    color: '#8983bf',
                },
                data: [
                    {
                        name: room_dict[props.typeName].name + " (" + room_dict[props.typeName].unit + ")",
                        value: props.typeValue,
                    },
                ],
            },
        ],
    };
    chart.setOption(option);
}

const props = defineProps({
    typeValue: {
        type: Number,
        default: 0,
    },
    typeName: {
        type: String,
        default: '温度',
    },
});

onMounted(() => {
    initChart();
});

watch(() => props.typeValue, () => {
    initChart();
});

</script>

<style scoped></style>