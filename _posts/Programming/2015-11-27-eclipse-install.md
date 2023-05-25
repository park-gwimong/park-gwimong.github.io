---
layout: post
title: "우분투에서 개발환경 구축하기(eclipse+tomcat+svn+maven)"
date: 2015-11-27 11:56:00+0900
categories: Programming
tags: Eclipse Tomcat SVN Maven
mathjax: true
---

# 1. eclipse 설치  
eclipse는 설치파일을 다운받아 압축을 해제 하면 완료입니다.  
다운로드 주소 : http://eclipse.org/downloads  

원하는 버전을 다운받아 압축 해제하면 끝.  
만약 apt-get으로 설치하게  되면 최신버전으로 설치가 됩니다.  
```shell
$sudo apt-get install eclipse
```

저같은 경우엔 Luna버전을 설치하기 위해 직접 다운로드하였습니다.  
![error](/resource/2015/20151127/20151127-eclipse-install-1.png)

MORE DOWNLOADS에서 원하는 버전의 다운로드 페이지로 이동 할 수 있습니다.


웹 개발을 위한 개발 환경 구축을 할 것임으로  
Eclipse IDE for Java EE Developers를 다운로드 하였습니다.  

이러한 버전에 따라 개발환경 구축 시 꼬일 수가 있으니 어떤 개발 환경을 구축할 것인지에 따라 잘 선택해야 합니다.  
각 버전에 따라 필요한 plug-in이 추가되어 있거나 설정값이 다릅니다. 

<br>

# 2. JDK 설치  
우분투에서 기본으로 설치되어 있는 JDK는 "java-7-openjdk-amd64"입니다.  
openJDK라고 리눅스 진영에서 개발한 JDK인것 같은데, 그냥 JDK1.7를 설치합니다.  
다운로드 주소 : http://www.oracle.com/technetwork/java/javase/downloads/jre7-downloads-1880261.html  

다운로드 받은 JDK파일을 압축해제 한 후 path로 지정합니다.

```sehll
$mv jdk-7u79-linux-x64.tar.gz /usr/lib/jvm/

$cd /usr/lib/jvm

$tar -xvf jdk-7u79-linux-x64.tar.gz
```
리눅스에서 참조하는 java path 지정하는 건 생략,  
이후 eclipse에서 해당 프로젝트의 java bulid path를 변경

<br>

# 3. tomcat 설치  
tomcat파일을 다운로드 받아 압축해제 하면 끝.  
만약 apt-get으로 자동 설치하면 설정 파일들이 분산되어 설치가 됩니다.  
> Tomcat home : /usr/share/tomcat7  
Tomcat conf : /var/lib/tomcat7/conf  
Tomcat log : /var/log/tomcat7  
Tomcat root directory : /var/lib/tomcat7  

was를 구동하는데는 문제가 없지만 Eclipse에서 tomcat을 연동하기 위해서는 추가적인 작업이 필요합니다.  
분산된 설정 파일에 다한 링크를 생성해 줍니다.  

```bash
$sudo apt-get install tomcat7
$cd /usr/share/tomcat7
$sudo ln -s /etc/tomcat7/policy.d/03catalina.policy ./conf/catalina.policy
$sudo ln -s /var/log/tomcat7 log
$sudo ln -s /var/lib/tomcat7/conf conf
$sudo ln -s /var/lib/tomcat7/common common
$sudo ln -s /var/lib/tomcat7/server server
$sudo ln -s /var/lib/tomcat7/shared shared
$sudo chmod -R 777 conf
```

<br>

# 4. Eclipse와 (SVN+Spring+Maven) 연동  
SVN과 연동하기 위해 필요한 plug-in을 설치합니다.  
plug-in파일을 다운로드 받아 Eclipse 설치 디렉토리에 바로 넣는 방법도 있지만, 간단하게 MarketPlace를 이용해서 다운로드 받습니다.    
![error](/resource/2015/20151127/20151127-eclipse-install-2.png)

다음의 기능과 연동하기 위해 추가적으로 plug-in을 설치합니다.  

- svn : Subversive – SVN Team Provider
- sts : Spring Tool Suite(STS) for Eclipse 
- maven :  m2e(Maven Integration for Eclipse (Luna) ← update
- wtp : Maven Integration for Eclipse WTP

<br>

# 5. SVN 서버로부터 프로젝트 파일 가져오기.  
Svn Repository exploring 실행  
![error](/resource/2015/20151127/20151127-eclipse-install-3.png)

최초로 실행하면 SVN connet를 설치하라는 Maketplace가 실행됩니다.  
Svn kit 1.7을 선택하여 설치합니다.  
정상 설치 되었을 경우 SVN Connetor에 SVNKit 1.7이 선택되어 있습니다.  
(다른 것들도 모두 선택하여 설치한후 이 후 설정에서 변경 할 수 있음)  
![error](/resource/2015/20151127/20151127-eclipse-install-4.png)


Svn Repository exploring에서 New-Repository location 클릭하여 SVN 저장소를 추가합니다.
![error](/resource/2015/20151127/20151127-eclipse-install-5.png)  


프로젝트가 maven과 연동되어 있는 프로젝트일 경우.

> 
1) Svn 서버로부터 가져올 데이터를 선택 한 후 check-out 실행  
2) 가져온 프로젝트를 maven 프로젝트로 변환  
(프로젝트 선택 후 마우스 오른쪽 클릭 → Configure → Convert To maven Project
3) maven으로 부터 라이브러리 다운로드.  
    (maven을 위한 설정은 pom.xml에 있으며 이에 대한 내용은 생략)  
    프로젝트 선택 후 마우스 오른쪽 클릭 → maven → update porject  
4) maven으로부터 정상적으로 라이브러리 추가 된 경우 아래와 같음.  
![error](/resource/2015/20151127/20151127-eclipse-install-6.png)

<br>

# 6. Eclipse와 tomcat 연동  
Eclipse에 sever를 추가합니다.  
![error](/resource/2015/20151127/20151127-eclipse-install-7.png)  
Tomcat의 설치 디렉토리를와 사용될 JRE 위치를 지정합니다.  

앞전에 Tomcat의 설정 파일 링크를 정상적으로 수행되지 않았을 경우 여기서 문제가 발생합니다.  
※ eclipse에 추가된 Tomcat에서 프로젝트를 복사하여 올렸을 때 class파일만 로드 시키지 못하는 경우  
> → 프로젝트의 경로에 src와 class의 생성된 위치가 다른기 때문, 이를 동일하게 맞추면 해결.  
eclipse에서 컴파일하고 class를 생성하는 위치 : java Build Path-Defaault output folder  
eclipse의 웹 프로젝트에서 소스를 컴파일하면 workplace내에 임시로 구동 환경을 구축함. 

위치 : workpase/.metadata/.plugins/org.eclipse.wst.server.core.tmp0/wtpwebapps

Tomcat에서 소스를 참조하는 위치 
- server.xml에 appBase="webapps" ← ROOT  
- Context docBase=”여기” ← 참조할 이름


여기까지 모두 완료하면 Eclipse에서 SVN프로젝트를 가져와 Tomcat에 올려 개발을 할 수 있는 환경이 구축됩니다..