---
layout: post
title: "Windows에서 NFS 공유 폴더 쓰기 실패"
subtitle: "오류 내용 : 이 작업을 수행하기 위한 권한이 필요합니다."
date: 2020-05-22 11:26:00+0900
categories: TroubleShooting
tags: Samba NFS SELinux
mathjax: true
---

# 시스템 구성
## NFS Server 구축
1. NFS 패키지 설치
```bash
#sudo yum install -y nfs-utils
```
2. exports 설정  
exports 파일에 nfs 정보를 설정합니다. ([자세히](https://linux.die.net/man/5/exports))
```bash
#sudo vim /etc/exports
```
> /home/test 192.168.100.*(rw,no_all_squash)

3. nfs server 실행
```bash
#sudo systemctl restart nfs-server
```

4. NFS 서비스 확인
```bash
#showmount -e
```


## NFS Clinet(Windows)
1. Windows의 NFS 기능 켜기  
![screenshot_1](/resource/NFSMountWriteFail/WindowsOnNFS.png)  
* Windows 10 Enterprise 이상에서 제공되는 기능입니다.
* Windows 10 Pro(version 10.0.14393 and above)에서도 제공됩니다.
2. 네트워크 드라이브 추가
![screenshot_2](/resource/NFSMountWriteFail/CreateNetworkDrive.png)

# 오류 내용
네트워크 드라이브가 정상적으로 추가되어 읽기는 가능하나 쓰기 실패.  
![screenshot_3](/resource/NFSMountWriteFail/NFSMountWriteFail.png)

# 원인 분석
1. NFS Server의 권한을 확인 해보자  
> drxwrxwr-x 1 test test   18 Dec 29  2019 log

2. NFS 문제가 문제 있을 수도 있으니, Samba로 해보자!  
&#58; Samba로 서비스해도 동일함

3. 방화벽 정보를 확인해보자  
```bash
#sudo systemctl status firewalld
```
> firewalld.service - firewalld - dynamic firewall daemon  
Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)  
__Active: inactive (dead)__  
Docs: man:firewalld(1)  

4. SELinux를 확인해보자  
```bash
#sudo sestatus
```
> 
__SELinux status:                 enabled__  
SELinuxfs mount:                /sys/fs/selinux  
SELinux root directory:         /etc/selinux  
Loaded policy name:             targeted  
**Current mode:                   enforcing**  
Mode from config file:          disabled  
Policy MLS status:              enabled  
Policy deny_unknown status:     allowed  
Max kernel policy version:      28  
<br>

* SELinux가 활성화 되어 있었습니다.  
이를 일시적으로 해제합니다.  
```bash
#sudo setenforce 0
```
* SELinux 모드를 확인합니다.
```bash
#sudo sestatus
```
> 
SELinux status:                 enabled  
SELinuxfs mount:                /sys/fs/selinux  
SELinux root directory:         /etc/selinux  
Loaded policy name:             targeted  
**Current mode:                   permissive**  
Mode from config file:          disabled  
Policy MLS status:              enabled  
Policy deny_unknown status:     allowed  
Max kernel policy version:      28  
* Permissve는 SELinux 보안 정책을 위반할 경우 수행은 하되, 로그로 남깁니다.  
* 영구적으로 해제 하기 위해서는 /etc/sysconfig/selinux 파일에 SELINUX의 값을 enforcing에서 disabled로 변경 후 저장합니다.(재부팅후 적용 됨)  

혹시나 싶어 다른 Linux에 NFS를 마운트하여 테스트해 보니, 정상적으로 마운트도 되고 파일 쓰기도 잘 됩니다.  
그렇다면 Windows에서 먼가 설정이 잘못 된 것 같네요.  

> Enable Write Permissions for the Anonymous User
With the default options you will only have read permissions when mounting a UNIX share using the anonymous user. We can give the anonymous user write permissions by changing the UID and GID that it uses to mount the share.  
The image below shows the a share mounted using the default settings.[[원글]](https://graspingtech.com/mount-nfs-share-windows-10/)

Windows에서 제공하는 NFS Clinet는 기본적으로 익명 사용자로 마운트합니다.  

Winodws Server에서는 mount 명령어의 옵션([자세히])(https://docs.microsoft.com/ko-kr/windows-server/administration/windows-commands/mount)으로 사용자 등을 지정 할 수 있지만, Windows 10의 NFS Client에는 제공되지 않는 것 같습니다.  


## 문제 해결
Windows10에서는 특정 사용자로 로그인 할 수는 없지만, 익명 사용자로 접근은 하되 UID,GID를 지정 하는 방법은 있습니다.

### 방법 1 - NFS Client에서 UID,GID 지정
1. 레지스트리 편집기 실행 
2. 레지스트리의 위치로 이동  
> HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\ClientForNFS\CurrentVersion\Default
3. 레지스트리에 신규 값 추가  
	1. "AnonymouseUid"를 생성한다(DWORD 32bit) 
	2. "AnonymouseGid"를 생성한다(DWORD 32bit) 
4. 각 레지스트리에 UID, GID 입력(10진수로)
5. 시스템 재부팅

명령 프롬프트에서 마운트하여 정보를 확인해보면, UID,와 GID가 레지스트리에 설정된 값으로 지정된 것을 확인 할 수 있습니다.  
![screenshot_4](/resource/NFSMountWriteFail/Result-Mount.png)


### 방법 2 - NFS Server에서 UID, GID 지정
exports 파일에 nfs 정보를 설정합니다.
```bash
#sudo vim /etc/exports
```
> /home/test 192.168.100.*(rw,anonuid=1003,anongid=1003)

