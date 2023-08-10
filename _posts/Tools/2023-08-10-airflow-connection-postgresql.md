---
layout: post
title: "Airflow connections 추가하기"
subtitle: "Airflow Provider Package"
date: 2023-08-10 17:34:00+0900
categories: [ Tools ]
tags: [ "Airflow" ]
mathjax: true
---

# airflow
Airflow™ is a platform created by the community to programmatically author, schedule and monitor workflows.  
데이터 파이프라인을 위한 오픈 소스 워크플로우 관리 플랫폼입니다.  

Python으로 작성된 DAG를 워크플로우 형태로 실행 할 수 있습니다.  

pip으로 간단하게 설치하고, 관리를 위한 WEB을 제공합니다.   
[[설치 방법]](https://airflow.apache.org/docs/apache-airflow/stable/start.html)


## Connections
Airflow의 Connection는 외부 서비스에 연결하는데 필요한 자격 증명 및 기타 정보를 저장하는데 사용됩니다.  
연결 정보는 아래의 방법으로 정의 할 수 있습니다. 
- Environment variables
- Secrets Backend
- Airflow metadata database

---

### Environment variables
JSON 또는 URI 형식의 환경 변수로 정의합니다. [[상세]](https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html#environment-variables-connections)

JSON 형식
```shell
export AIRFLOW_CONN_MY_PROD_DATABASE='{
    "conn_type": "my-conn-type",
    "login": "my-login",
    "password": "my-password",
    "host": "my-host",
    "port": 1234,
    "schema": "my-schema",
    "extra": {
    "param1": "val1",
    "param2": "val2"
    }
}'
```

URI 형식
```shell
export AIRFLOW_CONN_MY_PROD_DATABASE='my-conn-type://login:password@host:port/schema?param1=val1&param2=val2'
```

---

### Secrets Backend  
Airflow와 연동되는 서비스의 공급자를 통해 연결 정보를 정의합니다.  [[상세]](https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/secrets-backend/index.html#community-secret-backends)

지원하는 제공자는 다음과 같습니다.  
> Amazon
> - SecretsManagerBackend
> - SystemsManagerParameterStoreBackend  

> Google
> - CloudSecretManagerBackend

> Hashicorp
> - VaultBackend

> Microsoft Azure
> - AzureKeyVaultBackend

---

### Airflow metadata database
데이터베이스에 연걸 정보를 저장합니다.  

#### UI로 연결 만들기
1. Admin->Connections를 클릭하여 연결 관리 화면으로 이동합니다.  
   ![img](/resource/2023/20230810/20230810-img-1.png)  
2. [Add a New recode] 버튼을 클릭하여 새연결 생성하기 화면으로 이동합니다.  
   ![img](/resource/2023/20230810/20230810-img-2.png)
3. 연결 정보를 입력하고 [Save] 버튼을 클릭합니다.  
   ![img](/resource/2023/20230810/20230810-img-3.png)

> Connection Type missing? Make sure you've installed the corresponding Airflow Provider Package.  

필요 시 Airflow Provider를 추가합니다.  
[Providers packages reference](https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html)  

#### CLI로 연결 추가하기
CLI에서 JSON형식으로 연결을 추가 할 수 있습니다.  
```shell
airflow connections add 'my_prod_db' \
    --conn-json '{
        "conn_type": "my-conn-type",
        "login": "my-login",
        "password": "my-password",
        "host": "my-host",
        "port": 1234,
        "schema": "my-schema",
        "extra": {
            "param1": "val1",
            "param2": "val2"
        }
    }'
```