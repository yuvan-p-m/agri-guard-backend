import os,requests,logging
logger=logging.getLogger(__name__)
def get_weather(location):
    default_weather={"temp":28,"humidity":45,"rain":"No","wind_speed":12,"description":"Clear","irrigation":"Morning","tomorrow_forecast":"Sunny with light breeze"}
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")

	if not api_key:
    		logger.warning("OPENWEATHER_API_KEY is not configured")
    		return default_weather

	loc_str = str(location).strip() if location else "Nagpur"
        params={"appid":api_key,"units":"metric"}
        if "," in loc_str and all([part.strip().replace(".","").replace("-","").isdigit() for part in loc_str.split(",")]):
            parts=loc_str.split(",")
            params["lat"]=float(parts[0].strip())
            params["lon"]=float(parts[1].strip())
        else:
            clean_city=loc_str.split("(")[0].split("-")[0].strip()
            params["q"]=clean_city if clean_city else "Nagpur"
        res=requests.get("https://api.openweathermap.org/data/2.5/weather",params=params,timeout=8)
        if res.status_code!=200:
            logger.error(f"weather_api_error:{res.status_code}:{res.text}")
            return default_weather
        data=res.json()
        temp=round(float(data.get("main",{}).get("temp",28)))
        humidity=round(float(data.get("main",{}).get("humidity",45)))
        weather_list=data.get("weather",[])
        desc=weather_list[0].get("description","Clear").title() if len(weather_list)>0 else "Clear"
        main_weather=weather_list[0].get("main","").lower() if len(weather_list)>0 else ""
        rain_val="Yes" if("rain" in main_weather or "rain" in desc.lower() or "drizzle" in main_weather or "thunderstorm" in main_weather)else "No"
        raw_wind=float(data.get("wind",{}).get("speed",3.5))
        wind_kmh=round(raw_wind*3.6)
        irrigation="Morning" if(humidity<40 or rain_val=="No")else "Evening"
        tomorrow_desc="Clear skies and mild conditions" if rain_val=="No" else "Moderate humidity with chances of light showers"
        return {"temp":temp,"humidity":humidity,"rain":rain_val,"wind_speed":wind_kmh,"description":desc,"irrigation":irrigation,"tomorrow_forecast":tomorrow_desc}
    except Exception as e:
        logger.error(f"weather_service_exception:{str(e)}")
        return default_weather
