---
layout: post
title: "Linux에서 파일명이 한글인 파일의 인코딩을 일괄 변경"
date: 2015-11-18 21:17:00+0900
categories: Linux
tags: Linux 
mathjax: true
---

파일의 이름이 한글인 경우 시스템의 환경과 맞지 않으면 깨져서 보이게 됩니다.  
이 때 convmv를 이용하여 변경하면 됩니다.   

만약 설치가 안되있을 시
```bash
$sudo apt-get install convmv 로 설치하시기 바랍니다.
```

# 변경 방법
```bash
$convmv -f euc-kr -t utf-8 -r [파일 이름]
```
하면 변경된 파일 이름으로 보여줍니다. 하지만 실제로 변경되진 않습니다.

여기서 --notest 옵션을 붙여주면 테스트 결과를 보여주지 않고 바로 파일로 변경시켜 줍니다.
```bash
$convmv -f euc-kr -t utf-8 -r [파일 이름] --notest
```


# 파일의 내용에 한글이 포함되어 있어 깨지는 경우

## iconv를 이용하여 파일의 인코딩을 변경하는 방법  
```bash
$iconv -f [변경 전 인코딩 ] -t [변경 할 인코딩] [변경 할 파일]
```
위와 같이 수행하면 해당 파일의 변경된 인코딩으로 보여집니다.  
이를 파일로 저장하면 됩니다.  

```bash
iconv -f [변경 전 인코딩 ] -t [변경 할 인코딩] [변경 할 파일] > [변경할 파일 이름]
```

> 예시) a.c 라는 파일의 인코딩이 EUC-KR이고 이를  UTF-8로 변경하고 할 경우
```bash
$iconv -f EUC-KR -t UTF-8 a.c > a_utf8.c
```


매번 파일을 변경하고 하는 것은 매우 불편하고 귀찮은 작업입니다.

이를 스크립트로 간단하게 구현하여 실행하면 됩니다.
```bash
#!/bin/sh
files=$(find . -type -name "*.*")
for file in $files; do

iconv -f euckr -t utf8 $file > $file.tmp && mv -f $file.tmp $file

done

exit 0 
```