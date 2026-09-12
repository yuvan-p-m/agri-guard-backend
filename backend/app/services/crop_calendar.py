from datetime import datetime
from typing import Dict,Any

crop_calendar={
"rice":{"sow":[6,7],"harvest":[9,10],"base_price":2800},
"wheat":{"sow":[10,11],"harvest":[3,4],"base_price":2600},
"maize":{"sow":[6,7],"harvest":[9,10],"base_price":2200},
"sugarcane":{"sow":[2,3],"harvest":[12,1],"base_price":380},
"cotton":{"sow":[5,6],"harvest":[11,12],"base_price":7200},
"groundnut":{"sow":[6,7],"harvest":[10,11],"base_price":6400},
"mustard":{"sow":[10,11],"harvest":[2,3],"base_price":5800},
"soybean":{"sow":[6,7],"harvest":[10,11],"base_price":4700},
"tomato":{"sow":[6,7],"harvest":[10,11],"base_price":2100},
"onion":{"sow":[10,11],"harvest":[1,3],"base_price":2400},
"potato":{"sow":[10,11],"harvest":[1,3],"base_price":1600},
"bajra":{"sow":[6,7],"harvest":[9,10],"base_price":2350},
"jowar":{"sow":[6,7],"harvest":[9,10],"base_price":3180},
"turmeric":{"sow":[6,7],"harvest":[1,2],"base_price":13500},
"chilli":{"sow":[6,7],"harvest":[12,1],"base_price":19000},
"ragi":{"sow":[6,7],"harvest":[10,11],"base_price":3850},
"barley":{"sow":[10,11],"harvest":[3,4],"base_price":1850},
"sunflower":{"sow":[1,2],"harvest":[4,5],"base_price":6700},
"garlic":{"sow":[10,11],"harvest":[3,4],"base_price":14000},
"ginger":{"sow":[4,5],"harvest":[12,1],"base_price":8500},
"banana":{"sow":[3,4],"harvest":[10,12],"base_price":2600},
"apple":{"sow":[1,2],"harvest":[8,10],"base_price":9500},
"grapes":{"sow":[10,11],"harvest":[2,4],"base_price":6200},
"orange":{"sow":[6,7],"harvest":[11,2],"base_price":4500},
"papaya":{"sow":[6,7],"harvest":[3,5],"base_price":2200},
"pomegranate":{"sow":[6,7],"harvest":[11,1],"base_price":11000},
"watermelon":{"sow":[1,2],"harvest":[4,5],"base_price":1400},
"muskmelon":{"sow":[1,2],"harvest":[4,5],"base_price":1800},
"coconut":{"sow":[5,6],"harvest":[1,12],"base_price":3200},
"coffee":{"sow":[6,7],"harvest":[11,1],"base_price":24000},
"jute":{"sow":[3,4],"harvest":[7,8],"base_price":5050},
"blackgram":{"sow":[6,7],"harvest":[9,10],"base_price":7400},
"chickpea":{"sow":[10,11],"harvest":[2,3],"base_price":5450},
"kidneybeans":{"sow":[5,6],"harvest":[9,10],"base_price":8900},
"lentil":{"sow":[10,11],"harvest":[2,3],"base_price":6000},
"mothbeans":{"sow":[6,7],"harvest":[9,10],"base_price":6200},
"mungbean":{"sow":[6,7],"harvest":[8,9],"base_price":8550},
"pigeonpeas":{"sow":[6,7],"harvest":[12,1],"base_price":7000},
"rubber":{"sow":[6,7],"harvest":[1,12],"base_price":18500},
"sesame":{"sow":[6,7],"harvest":[9,10],"base_price":8600},
"okra":{"sow":[6,7],"harvest":[8,10],"base_price":2900}
}

def get_crop_alert(crop_name:str)->Dict[str,Any]:
    clean_crop=crop_name.lower().strip()
    curr_month=datetime.now().month
    cal=crop_calendar.get(clean_crop)
    if not cal:
        return {
            "crop":crop_name.capitalize(),
            "alert_type":"general_monitoring",
            "message":f"Monitor local market prices weekly for {crop_name.capitalize()} before finalizing sales.",
            "recommendation":"Check multiple local mandis to obtain the highest modal price."
        }
    harvest_months=cal.get("harvest",[])
    sow_months=cal.get("sow",[])
    if curr_month in harvest_months:
        return {
            "crop":crop_name.capitalize(),
            "alert_type":"harvest_approaching",
            "message":f"Harvest season active for {crop_name.capitalize()}. Supply influx may pressure mandi prices downward. Consider selling prompt shipments.",
            "recommendation":"Sell at high-demand regional mandis immediately or arrange dry warehouse storage."
        }
    elif any(abs(curr_month-hm)<=1 for hm in harvest_months):
        return {
            "crop":crop_name.capitalize(),
            "alert_type":"pre_harvest_window",
            "message":f"Harvest season approaching for {crop_name.capitalize()} within 3-4 weeks. Prices may adjust after fresh arrivals.",
            "recommendation":"Track daily modal rates across top state mandis and prepare transport logistics."
        }
    elif curr_month in sow_months:
        return {
            "crop":crop_name.capitalize(),
            "alert_type":"sowing_season",
            "message":f"Sowing and vegetative phase for {crop_name.capitalize()}. Old stock rates remain steady in wholesale markets.",
            "recommendation":"You have ample time. Monitor price movements weekly before making inventory decisions."
        }
    else:
        return {
            "crop":crop_name.capitalize(),
            "alert_type":"post_harvest_storage",
            "message":f"Off-peak seasonal trading for {crop_name.capitalize()}. Mandi arrivals are moderate.",
            "recommendation":"Evaluate price trends over 8 weeks to determine optimal selling timeframe."
        }
