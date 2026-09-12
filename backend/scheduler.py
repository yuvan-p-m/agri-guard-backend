import os,logging,datetime
from apscheduler.schedulers.background import BackgroundScheduler
from firebase_service import get_all_farmers,get_farmer_sensor_data
from weather_service import get_weather
from sms_service import send_sms
logger=logging.getLogger(__name__)
_scheduler=None
_tips_list=[
"Apply fertilizer in cool hours to reduce evaporation.",
"Check for pest activity near leaf edges after rain.",
"Irrigate at root level to conserve water.",
"Harvest in early morning for best crop quality.",
"Mulch soil to retain moisture during hot days."
]
def job_morning_weather():
    try:
        farmers=get_all_farmers()
        for farmer in farmers:
            try:
                name=farmer.get("name","Farmer").strip()
                mobile=str(farmer.get("mobile","")).strip()
                loc=farmer.get("location","Nagpur")
                if not name or not mobile:
                    continue
                weather_data=get_weather(loc)
                temp=weather_data.get("temp",28)
                humidity=weather_data.get("humidity",45)
                rain=weather_data.get("rain","No")
                irrigation=weather_data.get("irrigation","Morning")
                msg=f"Good Morning {name}! Today: Temp {temp}C, Humidity {humidity}%, Rain: {rain}. Best irrigation time: {irrigation}."
                send_sms(mobile,msg)
            except Exception as item_e:
                logger.error(f"morning_job_farmer_error:{str(item_e)}")
    except Exception as e:
        logger.error(f"job_morning_weather_exception:{str(e)}")
def job_soil_sensors():
    try:
        farmers=get_all_farmers()
        for farmer in farmers:
            try:
                name=farmer.get("name","Farmer").strip()
                mobile=str(farmer.get("mobile","")).strip()
                crop=farmer.get("crop","Citrus").strip()
                if not name or not mobile:
                    continue
                sensors=get_farmer_sensor_data(farmer)
                moisture=round(float(sensors.get("soil_moisture",35.0)))
                ph_val=round(float(sensors.get("ph",6.5)),1)
                nitrogen=round(float(sensors.get("nitrogen",45.0)))
                action="all good"
                if moisture<30:
                    action="irrigate now"
                elif ph_val<6.0:
                    action="add lime"
                else:
                    action="all good"
                msg=f"Sensor Update for {crop} farm: Moisture: {moisture}%, pH: {ph_val}, Nitrogen: {nitrogen}ppm. Action: {action}"
                send_sms(mobile,msg)
            except Exception as item_e:
                logger.error(f"soil_job_farmer_error:{str(item_e)}")
    except Exception as e:
        logger.error(f"job_soil_sensors_exception:{str(e)}")
def job_midday_weather():
    try:
        farmers=get_all_farmers()
        for farmer in farmers:
            try:
                name=farmer.get("name","Farmer").strip()
                mobile=str(farmer.get("mobile","")).strip()
                loc=farmer.get("location","Nagpur")
                if not name or not mobile:
                    continue
                weather_data=get_weather(loc)
                temp=weather_data.get("temp",30)
                wind=weather_data.get("wind_speed",12)
                task_tip="avoid fieldwork now" if temp>38 else "good time for light farming tasks"
                msg=f"Afternoon {name}: Temp {temp}C, Wind {wind}km/h. {task_tip}"
                send_sms(mobile,msg)
            except Exception as item_e:
                logger.error(f"midday_job_farmer_error:{str(item_e)}")
    except Exception as e:
        logger.error(f"job_midday_weather_exception:{str(e)}")
def job_evening_tips():
    try:
        farmers=get_all_farmers()
        day_num=datetime.datetime.now().timetuple().tm_yday
        tip_text=_tips_list[day_num%len(_tips_list)]
        for farmer in farmers:
            try:
                name=farmer.get("name","Farmer").strip()
                mobile=str(farmer.get("mobile","")).strip()
                crop=farmer.get("crop","Citrus").strip()
                loc=farmer.get("location","Nagpur")
                if not name or not mobile:
                    continue
                weather_data=get_weather(loc)
                tomorrow_forecast=weather_data.get("tomorrow_forecast","Clear skies and mild conditions")
                msg=f"Evening Tip for {crop} farmers: {tip_text} Tomorrow: {tomorrow_forecast}."
                send_sms(mobile,msg)
            except Exception as item_e:
                logger.error(f"evening_job_farmer_error:{str(item_e)}")
    except Exception as e:
        logger.error(f"job_evening_tips_exception:{str(e)}")
def start_scheduler():
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return _scheduler
    try:
        _scheduler=BackgroundScheduler()
        _scheduler.add_job(job_morning_weather,"cron",hour=7,minute=0,id="morning_weather_job",replace_existing=True)
        _scheduler.add_job(job_soil_sensors,"cron",hour=10,minute=0,id="soil_sensor_job",replace_existing=True)
        _scheduler.add_job(job_midday_weather,"cron",hour=13,minute=0,id="midday_weather_job",replace_existing=True)
        _scheduler.add_job(job_evening_tips,"cron",hour=18,minute=0,id="evening_tips_job",replace_existing=True)
        _scheduler.start()
        logger.info("apscheduler_started_with_4_daily_cron_jobs")
    except Exception as e:
        logger.error(f"start_scheduler_exception:{str(e)}")
    return _scheduler
