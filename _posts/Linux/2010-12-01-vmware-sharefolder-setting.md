---
layout: post
title: "VMWare에서 리눅스 공유 폴더 설정하기"
date: 2010-12-01 04:40:00+0900
categories: Linux
tags: Linux Utility VMWare
mathjax: true
---

VMware에 리눅스를 설치하여 사용하는 경우가 많은데 이때 공유 폴더를 설정하면 편리합니다.  
공유폴더를 이용하기 위해서는 VMware Tools 를 설치하여야 합니다.

> 환경 :  
Fedora Core 4  
VMware Workstion 7.0.1  

# VMware Tools 설치
![img](/resource/20101201/20101201-img-1.png)

VMware 창에서 Install VMware Tools를 클릭하면 설치파일이 VMware에서 동작중인 페도라에 cd-rom에 마운트되어집니다.  

이제부터 작업은 터미널에서 root 권한으로 작업하겠습니다.  

```shell
[root@localhost /]# cd /media/cdrom
[root@localhost /]# cp VMwareTools-8.1.4-227600.tar.gz /home/
```

압축을 풀기 위해 설치파일을 /home 디렉토리로 복사하였습니다.

```shell
[root@localhost /]t# ar -xvf VMwareTools-8.1.4-227600.tar.gz
```

압축을 푼 디렉토리에 보면 vmware-install.pl<-- 설치 실행 파일이 있습니다.

![img](/resource/20101201/20101201-img-2.png)

```shell
[root@localhost vmware-tools-distrib]# ./vmware-install.pl
```

실행시키면 설치가 시작되는데 몇가지 물어보는데 그냥 계속 엔터를 눌러주시면 됩니다.
이때 GCC가 설치되어 있어야 하는데 만약 설치되어 있지 않다면

```shell
[root@localhost vmware-tools-distrib]#  yum install gcc
```
으로 gcc를 설치해주시면 됩니다.


설치도중에 아래처럼 메세지가 나오면 커널 소스가 맞지 않는것이므로 커널을 버전에 맞게 설치해주어야 합니다.  
![img](/resource/20101201/20101201-img-3.png)

ctr+c로 설치를 중지 시킨 다음

```shell
[root@localhost vmware-tools-distrib]# yum install kernel-devel
```

설치가 완료되면 재부팅한뒤
```shell
[root@localhost vmware-tools-distrib]# ./vmware-install.pl
```

다시 실행 주면 됩니다.  

계속 엔터만 누르다보면 display 설정하는 부분이 나옵니다.  
![img](/resource/20101201/20101201-img-3.png)

원하시는 해상도 번호를 입력하시면 됩니다.  

<br>

# 공유폴더 설정
VMware Tools가 설치가 되었으면 VMware과 페도라 간의 공유폴더를 추가합니다.  
이부분은 다른 OS(우분투나, 윈도우나 기타 등등) 설정 부분과 같습니다.  
![img](/resource/20101201/20101201-img-4.png)

Add 버튼을 클릭하여 공유할 폴더를 추가합니다.  
(간단한 작업이기 때문에 생략)  
아래는 추가된 모습입니다.  
![img](/resource/20101201/20101201-img-5.png)

이제 페도라에서 해당 공유 폴더에 접근하여 사용하면 됩니다.  
페도라 상에서 해당 공유 폴도의 위치는 /mnt/hgfs 입니다.  
![img](/resource/20101201/20101201-img-6.png)