import pandas as pd
import json

sheet_lists=["11414","15332","15795","15852","16355"]
data={}
for i,sheet in enumerate(sheet_lists):
# 加载Excel文件
    df = pd.read_excel('case.xlsx', sheet_name=sheet)  # 更改路径到你的文件位置

    # 初始化存储数据的字典
    data[i+1]={
            "co": df['co2(ppm)'].tolist(),
            "light": df['light(lux)'].tolist(),
            "pm25": df['pm2.5(ug/m3)'].tolist(),
            "t": df['temp(oC)'].tolist(),
            "h": df['humi(%)'].tolist()
        }

# 将字典转换为JSON格式的字符串
json_data = json.dumps(data, indent=2)

# 输出或保存结果
print(json_data)
# 如果需要将JSON数据保存到文件中
with open('output.json', 'w') as f:
    f.write(json_data)
