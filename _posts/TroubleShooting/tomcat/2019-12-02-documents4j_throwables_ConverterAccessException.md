---
layout: post
title: "Tomcat 배포시 documents4j ConverterAccessException"
date: 2019-12-02 12:43:00+0900
categories: TroubleShooting
tags: Tomcat Documents4j Java
mathjax: true
---

======================

STS + Spring Boot 환경에서 Documsnts4j를 이용하여 Docx를 PDF로 변환하는 코드를 구현하였습니다.  
STS의 개발 환경에서 구현하다 보니 Embedded Tomcat에서는 잘 동작하는데, 막상 서비스를 위해 Tomcat에 배포를 하니 Documtns4j의 Convert가 제대로 수행되지 않았습니다.  

Convert 수행시 Exception는 다음과 같습니다.
```
com.documents4j.throwables.ConverterAccessException: The converter seems to be shut down
	 at com.documents4j.util.Reaction$ConverterAccessExceptionBuilder.make(Reaction.java:117) ~[documents4j-util-all-1.0.2.jar:na]
	 at com.documents4j.util.Reaction$ExceptionalReaction.apply(Reaction.java:75) ~[documents4j-util-all-1.0.2.jar:na]
	 at com.documents4j.conversion.ExternalConverterScriptResult.resolve(ExternalConverterScriptResult.java:70) ~[documents4j-transformer-api-1.0.2.jar:na]
	 at com.documents4j.conversion.ProcessFutureWrapper.evaluateExitValue(ProcessFutureWrapper.java:48) ~[documents4j-util-transformer-process-1.0.2.jar:na]
	 at com.documents4j.conversion.ProcessFutureWrapper.get(ProcessFutureWrapper.java:36) ~[documents4j-util-transformer-process-1.0.2.jar:na]
	 at com.documents4j.conversion.ProcessFutureWrapper.get(ProcessFutureWrapper.java:11) ~[documents4j-util-transformer-process-1.0.2.jar:na]
	 at com.documents4j.job.AbstractFutureWrappingPriorityFuture.run(AbstractFutureWrappingPriorityFuture.java:78) ~[documents4j-util-conversion-1.0.2.jar:na]
	 at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142) ~[na:1.8.0_74]
	 at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617) ~[na:1.8.0_74]
	 at java.lang.Thread.run(Thread.java:745) ~[na:1.8.0_74]

```

Documnts4j는 VBScript를 이용하여 변환을 수행합니다.  
```
4:36:16.109 INFO  c.d.c.msoffice.MicrosoftWordBridge - From-Microsoft-Word-Converter was started successfully
14:36:16.112 INFO  com.documents4j.job.LocalConverter - The documents4j local converter has started successfully
14:36:16.124 INFO  c.d.c.msoffice.MicrosoftWordBridge - Requested conversion from C:\Users\gmpark\AppData\Local\Temp\1575264973533-0\68ed3e6b-ab29-47ff-8ee5-fafebe14c5a6\temp1 (application/vnd.com.documents4j.any-msword) to C:\Users\gmpark\AppData\Local\Temp\1575264973533-0\68ed3e6b-ab29-47ff-8ee5-fafebe14c5a6\temp2 (application/vnd.com.documents4j.pdf-a)
```
MicrosoftWordBridge가 정상적으로 수행되었고, VBScript도 정상적으로 생성하였습니다.  

먼저, 해당 VBScript가 정상적으로 수행되는지 확인해봅니다.  
(대상 파일 : C:\test.docx, 결과 파일 : C:\test.pdf, 변환 포맷 : 999(PDFA)

```bash
cd C:\Users\gmpark\AppData\Local\Temp\1575264973533-0
script word_convert754050868.vbs C:\test.docx C:\test.pdf 999

```

정상적으로 변환이 되네요...
Documents4j가 생성해준 VBScription는 이상이 없으니, Java에서 실행시켜주는게 문제일 것 같네요.  
STS 환경에선 정상적으로 수행이 됬으니, Tomcat 설정을 확인해봅니다.  

Tomcat은 기본적으로 Local Service account로 실행되도록 설정이 되어 있네요.  
해당 설정을 Local System account로 변경하고 재시작하였습니다.  


정상적으로 수행이 되네요!!  

Tomcat이 Local Service accout 권한인 경우 Word를 실행시키지 못해 발생하는 문제인 것 같네요.  
앞으로 Tomcat으로 배포시 유의해야 할 것 같습니다



