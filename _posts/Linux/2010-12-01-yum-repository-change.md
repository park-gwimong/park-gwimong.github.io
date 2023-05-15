---
layout: post
title: "Feodra 리눅스 yum 저장소 변경"
date: 2010-12-01 03:34:00+0900
categories: Linux
tags: Linux Utility Fedora Yum
mathjax: true
---

===

Fedora 4는 오래되었지만 저사양에서 사용하기 위해 사용되는 경우가 있습니다.  
하지만 이미 기본 저장소는 닫혀있는 상태이고 왠만한 미러사이트는 다 닫혀있었습니다.  
(sayclub이랑 kaist 쪽 미러사이트는 살아있는거 같지만,,확실하지는 않습니다.)

조금 많이 느리지만 fedoraproject 아카이브에서 받는게 가장 나을것 같습니다.  

> /etc/yum.repos.d/fedora.repo  
/etc/yum.repos.d/fedora-updates.repo  
/etc/yum.repos.d/fedora-extras.repo  

위 파일들의 baseurl을 수정해주면 됩니다.

[/etc/yum.repos.d/fedora.repo]
```bash
[base]
name=Fedora Core $releasever - $basearch - Base
baseurl=http://archives.fedoraproject.org/pub/archive/fedora/linux/core/4/i386/os/
#mirrorlist=http://fedora.redhat.com/download/mirrors/fedora-core-$releasever
#mirrorlist=file:///etc/yum.repos.d/custom-base
enabled=1
gpgcheck=0
```

[/etc/yum.repos.d/fedora-updates.repo]파일
```bash
[updates-released]
name=Fedora Core $releasever - $basearch - Released Updates
baseurl=http://archives.fedoraproject.org/pub/archive/fedora/linux/core/updates/4/i386/
#mirrorlist=http://fedora.redhat.com/download/mirrors/updates-released-fc$releasever
#mirrorlist=file:///etc/yum.repos.d/custom-updates
enabled=1
gpgcheck=0
```

[/etc/yum.repos.d/fedora-extras.repo]파일
```bash
[extras]
name=Fedora Extras $releasever - $basearch
baseurl=http://archives.fedoraproject.org/pub/archive/fedora/linux/extras/4/i386/
mirrorlist=http://fedora.redhat.com/download/mirrors/fedora-extras-$releasever
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-extras
gpgcheck=1
```