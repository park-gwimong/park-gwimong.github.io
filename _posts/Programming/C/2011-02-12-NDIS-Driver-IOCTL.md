---
layout: post
title: "NDIS 드라이버와 App 통신하기(IOCTL 통신)"
date: 2011-03-12 17:09:00+0900
categories: System
tags: NDIS
mathjax: true
---

NDIS 드라이버도 여타 다른 드라이버와 마찬가지로 IRP를 이용하여 통신하면 됩니다.

IRP를 이용한 통신은 시스템 버퍼에 데이터를 넣고 드라이버나 어플쪽에서 다시 시스템 버퍼에 접근하여 데이터를 가져오는 방식으로 데이터를 교환하게 됩니다.

드라이버와 App가 연결되었을때 IRP_MJ_CREATE메세지가 생성되고, 해제되었을 때 IRP_MJ_CLOSE 메세지가 생성됩니다. 그리고 App에서 드라이버로 입력이 있을경우 IRP_MJ_DEVICE_CONTROL 메세지가 생성됩니다.
이렇게 생성된 IRP메세지를 저장하고 있는 Irp스택에서 메세지를 가져와 해석하여 App가 어떤 일을 수행하고 있는지를 알수 있습니다.

Passthru에서는 PtDispatch()에 IRP관련된 코드들이 있습니다. 이를 수정하여 드라이버에서 어플에서 보낸 데이터를 가져오는 소스입니다.

먼저 사용할 IOCTL 코드를 만듭니다.
CTL_CODE를 이용하여 생성하면 됩니다.

```C
#define IOCTL_EXAMPLE_SAMPLE_DIRECT_IN_IO  CTL_CODE(FILE_DEVICE_UNKNOWN, 0x800, METHOD_IN_DIRECT, FILE_READ_DATA | FILE_WRITE_DATA)

#define IOCTL_EXAMPLE_SAMPLE_DIRECT_OUT_IO CTL_CODE(FILE_DEVICE_UNKNOWN,0x801, METHOD_OUT_DIRECT, FILE_READ_DATA | FILE_WRITE_DATA)

#define IOCTL_EXAMPLE_SAMPLE_BUFFERED_IO CTL_CODE(FILE_DEVICE_UNKNOWN, 0x802, METHOD_BUFFERED,  FILE_READ_DATA | FILE_WRITE_DATA)

#define IOCTL_EXAMPLE_SAMPLE_NEITHER_IO CTL_CODE(FILE_DEVICE_UNKNOWN, 0x803, METHOD_NEITHER, FILE_READ_DATA | FILE_WRITE_DATA)
```

METHOD_IN_DIRECT
METHOD_IOUT_DIRECT
METHOD_BUFFERED <-- 요놈
METHOD_NEITHER

FILE_READ_DATA | FILE_WRITE_DATA <-- 이부분이 버퍼에 접근 옵션입니다.
이 옵션에 따라서 SystemBuffer에 IO매니저가 하는 일이 조금 달라지는것 같습니다.
FILE_ANY_ACCESS<-- 이 옵션으로 해놓은 경우에 어플에서 드라이버로는 갈떄는 시스템버퍼에 데이터를 복사하는데, 다시 드라이버에서 어플로 돌아갈때 시스템버퍼에 잇는 값을 어플에서 받은 outBuffer로 복사하지를 않습니다.
(이거때문에 엄청 고생했네요...-_-)

드라이버 입출력하는 방법은 여러가지가 있는데 그중에 METHOD_BUFFERED 방식을 다룰겁니다.  

어플에서 DeviceIoControl를 호출하면 드라이버에서선 IRP_MJ_DEVICE_CONTROL 메세지를 날리는데, 이때 SystemBuffer의 주소값을 얻어 여기에 데이터를 읽고 쓰면 됩니다.  
[응용프로그램 <->IO관리자<->드라이버]
![ndis](/resource/20110212/20110212-NDIS-1.png)  

1. 어플에서 InputBuffer를 이용하여 IO관리자에게 넘겨줌
2. IO관리자는 이 값을 SystemBuffer에 복사, 드라이버는 SystemBuffer값을 참조하여 데이터를 가져옴
3. 드라버에서 SystemBuffer에 어플로 보내고자 하는 데이터를 복사
4. IO관리자가 어플로 SystemBuffer의 값을 어플에서 받고자 하는 OutBuffer으로 복사

<br>

---


## APP
<details>
<summary>소스보기</summary>

```C
#include <stdlib.h>
#include <stdio.h>
#include <windows.h>
//#include <fltuser.h>
#include <dbghelp.h>
#include <string.h>
#include <io.h>
#include <strsafe.h>
#include <winioctl.h>
#define IOCTL_EXAMPLE_SAMPLE_DIRECT_IN_IO  CTL_CODE(FILE_DEVICE_UNKNOWN, 0x800, METHOD_IN_DIRECT, FILE_READ_DATA | FILE_WRITE_DATA)
#define IOCTL_EXAMPLE_SAMPLE_DIRECT_OUT_IO CTL_CODE(FILE_DEVICE_UNKNOWN,0x801, METHOD_OUT_DIRECT, FILE_READ_DATA | FILE_WRITE_DATA)
#define IOCTL_EXAMPLE_SAMPLE_BUFFERED_IO CTL_CODE(FILE_DEVICE_UNKNOWN, 0x802, METHOD_BUFFERED,  FILE_READ_DATA | FILE_WRITE_DATA)
#define IOCTL_EXAMPLE_SAMPLE_NEITHER_IO CTL_CODE(FILE_DEVICE_UNKNOWN, 0x803, METHOD_NEITHER, FILE_READ_DATA | FILE_WRITE_DATA)
void main()
{
 HANDLE hDevice;
 LIST_ENTRY first;
 BOOL hResult;
 int counter;
 int buffer_counter;
 ULONG outputLength;
 ULONG inputLength;
 int order;
 char OutputBuffer[1024]  = "bbbbbbbbbbbbbb";
 char InputBuffer[1024] = "aaaaaaaaaaaaaa";
 ZeroMemory(OutputBuffer, 1024);
 hDevice = CreateFile(L"\\\\.\\PassThru", GENERIC_READ | GENERIC_WRITE, 0, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, (HANDLE)INVALID_HANDLE_VALUE);
 if(hDevice == INVALID_HANDLE_VALUE)
 {
  printf("드라이 핸들 얻기 실패\n");
 }
while(1)
 {
  scanf("%d", &order);
  switch(order)
  {
   case 1:
    hResult =DeviceIoControl ( hDevice,(DWORD)IOCTL_EXAMPLE_SAMPLE_BUFFERED_IO, (PVOID)InputBuffer, sizeof( InputBuffer), (PVOID)OutputBuffer, sizeof( OutputBuffer), &outputLength,NULL);
    printf("num : %s\n", OutputBuffer);
    break;
  }
 }
}
```
</details>

![ndis](/resource/20110212/20110212-NDIS-2.png)  

---
## Driver

<details>
<summary>소스보기</summary>

```C
NTSTATUS
PtDispatch(
    IN PDEVICE_OBJECT    DeviceObject,
    IN PIRP              Irp
    )
/*++
Routine Description:
    Process IRPs sent to this device.
Arguments:
    DeviceObject - pointer to a device object
    Irp      - pointer to an I/O Request Packet
Return Value:
    NTSTATUS - STATUS_SUCCESS always - change this when adding
    real code to handle ioctls.
--*/
{
    PIO_STACK_LOCATION  irpStack;
    NTSTATUS            status = STATUS_SUCCESS;
    PCHAR pInputBuffer;
    PCHAR pOutputBuffer;
 ULONG inputBufferLength;
 ULONG outputBufferLength;
 ULONG FunctionCode;
 char pData[1024];
 pData[0] = 'h';
 pData[1] = 'e';
 pData[2] = 'l';
 pData[3] = 'l';
 pData[4] = 'o';
 pData[5] = '\n';
    UNREFERENCED_PARAMETER(DeviceObject);   
    DBGPRINT(("==>Pt Dispatch\n"));
    irpStack = IoGetCurrentIrpStackLocation(Irp);
    switch (irpStack->MajorFunction)
    {
        case IRP_MJ_CREATE:
   DbgPrint(" IRP_MJ_CREATE \n");
            break;           
        case IRP_MJ_CLEANUP:
   DbgPrint(" IRP_MJ_CLEANUP \n");
            break;           
        case IRP_MJ_CLOSE:
   DbgPrint(" IRP_MJ_CLOSE \n");
            break;                   
        case IRP_MJ_DEVICE_CONTROL:
            //
            // Add code here to handle ioctl commands sent to passthru.
            //
   DbgPrint(" IRP_MJ_DEVICE_CONTROL \n");
   pInputBuffer = Irp->AssociatedIrp.SystemBuffer;
   pOutputBuffer = Irp->AssociatedIrp.SystemBuffer;
   inputBufferLength = irpStack->Parameters.DeviceIoControl.OutputBufferLength;
   FunctionCode = irpStack->Parameters.DeviceIoControl.IoControlCode;
   switch(FunctionCode)
   {
    case 2285576:
     RtlCopyMemory(pOutputBuffer, pData, strlen(pData));
     break;
   }
   DBGPRINT(("==> FunctionCode : %d\n", FunctionCode));
   break;
  default:
   break;       
    }
    Irp->IoStatus.Status = status;
 Irp->IoStatus.Information = 1024;
    IoCompleteRequest(Irp, status, 1024);
    DBGPRINT(("<== Pt Dispatch\n"));
    return status;
}
```
</details>


![ndis](/resource/20110212/20110212-NDIS-3.png)  

> 참고로 2285576 값은 IOCTL_CODE로 생성한 IOCTL_EXAMPLE_SAMPLE_BUFFERED_IO의 값입니다.



참고사이트 :
http://www.codeproject.com/KB/system/driverdev2.aspx