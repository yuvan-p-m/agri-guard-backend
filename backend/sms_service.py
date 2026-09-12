import os,requests,logging
logger=logging.getLogger(__name__)
def clean_mobile_number(raw_mobile):
    try:
        raw_str=str(raw_mobile).strip().replace(" ","").replace("+91","").replace("-","")
        digits="".join([ch for ch in raw_str if ch.isdigit()])
        if len(digits)>=10:
            return digits[-10:]
        return ""
    except Exception as e:
        logger.error(f"mobile_clean_error:{str(e)}")
        return ""
def send_sms(mobile,message):
    try:
        api_key=os.getenv("FAST2SMS_API_KEY","PGfbclRo6SAng9JspBudE3VmFaOLz5ThkNeD1ZwjM4i8qQYXUxPB2uO3CVsQwp6zDanAR9FHvyjgf8NM")
        clean_mobile=clean_mobile_number(mobile)
        if len(clean_mobile)!=10:
            logger.error(f"invalid_mobile_skipped:{mobile}")
            return False
        clean_msg=str(message).strip()
        if not clean_msg:
            logger.error("empty_message_skipped")
            return False
        chunks=[]
        if len(clean_msg)<=160:
            chunks.append(clean_msg)
        else:
            for i in range(0,len(clean_msg),160):
                chunks.append(clean_msg[i:i+160])
        all_sent=True
        headers={"authorization":api_key,"Content-Type":"application/json"}
        for chunk in chunks:
            payload={"route":"q","message":chunk,"language":"english","flash":0,"numbers":clean_mobile}
            res=requests.post("https://www.fast2sms.com/dev/bulkV2",json=payload,headers=headers,timeout=10)
            if res.status_code!=200:
                logger.error(f"fast2sms_error:{res.status_code}:{res.text}")
                all_sent=False
            else:
                res_data=res.json()
                if not res_data.get("return",False):
                    logger.warning(f"fast2sms_warning:{res_data.get('message')}")
                    all_sent=False
                else:
                    logger.info(f"fast2sms_sent_success:{clean_mobile}")
        return all_sent
    except Exception as e:
        logger.error(f"send_sms_exception:{str(e)}")
        return False
