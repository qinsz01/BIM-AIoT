<template>
    <div class="energy">
        {{ room_dict[props.typeName].name }}
        <div ref="lineChart" class="linechart" :style="{ 'width': (width) + 'px' ,'height':'100%'}"></div>
    </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { watch, toRef, defineProps, onMounted } from 'vue';


const width=document.documentElement.clientWidth/7;
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
        "max": 200,
        "min": 0
    },
    "t": {
        "name": "温度",
        "unit": "℃",
        "max": 50,
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
        "max": 300,
        "min": 0
    }
}

const props = defineProps({
    typeValue: {
        type: Number,
        default: 0,
    },
    typeName: {
        type: String,
        default: '温度',
    }
});

const lineChart = toRef(null);

function initChart() {
    const chart = echarts.getInstanceByDom(lineChart.value) || echarts.init(lineChart.value);
    var option = {
        backgroundColor: '#33333375',
        tooltip: {
            show: false
        },
        title:{
            show:false
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: '#5d5d5d'
                }
            },
            axisLabel:{
                show:false
            }
        
        },
        yAxis: {
            type: 'value',
            min: room_dict[props.typeName].min,
            max: room_dict[props.typeName].max,
            splitLine: {
                show: false
            },
            axisLabel:{
                show:false
            }
        },
        series: [{
            name: '实时耗电量',
            type: 'line',
            showSymbol: true,
            hoverAnimation: true,
            data: []
        }]
    };
    chart.setOption(option);
    setInterval(function () {
        // console.log(option.series[0])
        if (option.series[0].data.length > 10)
            option.series[0].data.shift();
        option.series[0].data.push([
        (new Date()).getTime(), 
        props.typeValue]);
        const values=option.series[0].data.map(item=>item[1]);
        const min_val = Math.min(...values)-1;
        const max_val = Math.max(...values)+1;
        console.log(min_val,max_val)
        chart.setOption({
            yAxis: {
                min: min_val,
                max: max_val,
            },
            series: [{
                data: option.series[0].data
            }]
        });
    }, 3000);
}


onMounted(() => {
    initChart();
});

</script>

<style scoped>
.linechart {
    border: 1.5px, solid, #ffffff;
}
</style>