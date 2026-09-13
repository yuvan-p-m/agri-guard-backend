import os,json,logging,firebase_admin
from firebase_admin import credentials,firestore,auth
logger=logging.getLogger(__name__)
_firebase_initialized=False
_db_client=None
_mock_farmers={}
_disk_file_path=os.path.join(os.path.dirname(__file__),"farmers_local.json")
def _load_disk_farmers():
    global _mock_farmers
    try:
        if os.path.exists(_disk_file_path):
            with open(_disk_file_path,"r",encoding="utf-8") as f_in:
                _mock_farmers=json.load(f_in)
    except Exception as disk_e:
        logger.error(f"load_disk_farmers_error:{str(disk_e)}")
def _save_disk_farmers():
    try:
        with open(_disk_file_path,"w",encoding="utf-8") as f_out:
            json.dump(_mock_farmers,f_out,indent=2)
    except Exception as save_e:
        logger.error(f"save_disk_farmers_error:{str(save_e)}")
_load_disk_farmers()
def init_firebase():
    global _firebase_initialized,_db_client
    if _firebase_initialized:
        return _db_client
    try:
        cred_path=os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY","serviceAccountKey.json")
        if not os.path.isabs(cred_path):
            cred_path=os.path.join(os.path.dirname(__file__),cred_path)
        if os.path.exists(cred_path):
            try:
                cred=credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                _db_client=firestore.client()
                _firebase_initialized=True
                logger.info("firebase_admin_initialized_with_service_key")
            except Exception as fb_err:
                logger.warning(f"firebase_cert_init_warning:{str(fb_err)}")
                _firebase_initialized=False
        else:
            try:
                firebase_admin.initialize_app()
                _db_client=firestore.client()
                _firebase_initialized=True
                logger.info("firebase_admin_initialized_with_default_credentials")
            except Exception as inner_e:
                logger.warning(f"firebase_default_init_failed:{str(inner_e)}")
                _firebase_initialized=False
    except Exception as e:
        logger.error(f"firebase_init_exception:{str(e)}")
        _firebase_initialized=False
    return _db_client
def get_db():
    global _db_client
    if _db_client is None:
        init_firebase()
    return _db_client
def get_all_farmers():
    farmers_list=[]
    try:
        db=get_db()
        if db and _firebase_initialized:
            try:
                docs=db.collection("farmers").stream()
                for doc in docs:
                    data=doc.to_dict()
                    if not data:
                        continue
                    name=data.get("name","").strip()
                    mobile=str(data.get("mobile","")).strip()
                    if not name or not mobile:
                        continue
                    data["uid"]=data.get("uid") or doc.id
                    farmers_list.append(data)
                if len(farmers_list)>0:
                    return farmers_list
            except Exception as fs_err:
                logger.warning(f"firestore_stream_warning:{str(fs_err)}")
        for uid,data in _mock_farmers.items():
            name=data.get("name","").strip()
            mobile=str(data.get("mobile","")).strip()
            if name and mobile:
                data_copy=data.copy()
                data_copy["uid"]=uid
                farmers_list.append(data_copy)
        return farmers_list
    except Exception as e:
        logger.error(f"get_all_farmers_exception:{str(e)}")
        return farmers_list
def get_farmer_by_uid(uid):
    if not uid:
        return None
    uid_str=str(uid).strip()
    try:
        db=get_db()
        if db and _firebase_initialized:
            try:
                doc=db.collection("farmers").document(uid_str).get()
                if doc.exists:
                    data=doc.to_dict()
                    data["uid"]=uid_str
                    return data
                query=db.collection("farmers").where("uid","==",uid_str).limit(1).stream()
                for item in query:
                    data=item.to_dict()
                    data["uid"]=item.id
                    return data
            except Exception as fs_err:
                logger.warning(f"firestore_get_warning:{str(fs_err)}")
        if uid_str in _mock_farmers:
            data=_mock_farmers[uid_str].copy()
            data["uid"]=uid_str
            return data
        return None
    except Exception as e:
        logger.error(f"get_farmer_by_uid_exception:{str(e)}")
        if uid_str in _mock_farmers:
            data=_mock_farmers[uid_str].copy()
            data["uid"]=uid_str
            return data
        return None
def create_or_update_farmer(farmer_data):
    if not farmer_data:
        return None
    uid=str(farmer_data.get("uid","")).strip()
    if not uid:
        logger.error("missing_uid_in_farmer_data")
        return None
    try:
        _mock_farmers[uid]=farmer_data.copy()
        _save_disk_farmers()
        db=get_db()
        if db and _firebase_initialized:
            try:
                db.collection("farmers").document(uid).set(farmer_data,merge=True)
            except Exception as fs_err:
                logger.warning(f"firestore_set_warning:{str(fs_err)}")
        return farmer_data
    except Exception as e:
        logger.error(f"create_farmer_exception:{str(e)}")
        return farmer_data
def get_farmer_sensor_data(farmer_doc_or_uid):
    default_sensors={"soil_moisture":35.0,"ph":6.5,"nitrogen":45.0,"temperature":27.5}
    try:
        farmer_data=None
        if isinstance(farmer_doc_or_uid,str):
            farmer_data=get_farmer_by_uid(farmer_doc_or_uid)
        elif isinstance(farmer_doc_or_uid,dict):
            farmer_data=farmer_doc_or_uid
        if not farmer_data:
            return default_sensors
        if "sensor_data" in farmer_data and isinstance(farmer_data["sensor_data"],dict):
            sensors=farmer_data["sensor_data"]
            return {"soil_moisture":float(sensors.get("soil_moisture",35.0)),"ph":float(sensors.get("ph",6.5)),"nitrogen":float(sensors.get("nitrogen",45.0)),"temperature":float(sensors.get("temperature",27.5))}
        if "soil_moisture" in farmer_data:
            return {"soil_moisture":float(farmer_data.get("soil_moisture",35.0)),"ph":float(farmer_data.get("ph",6.5)),"nitrogen":float(farmer_data.get("nitrogen",45.0)),"temperature":float(farmer_data.get("temperature",27.5))}
        return default_sensors
    except Exception as e:
        logger.error(f"get_sensor_data_exception:{str(e)}")
        return default_sensors
init_firebase()
