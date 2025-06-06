import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}
  success(message: string, title: string = 'Success') {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Ok',
      timer: 2000,
    });
  }
  failure(message: string, title: string = 'Failed') {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Ok',
      timer: 2000,
    });
  }
  confirm(message: string, title: string = 'Confrim'): Promise<boolean> {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    }).then((result: SweetAlertResult) => {
      return result.isConfirmed;
    });
  }
  loading(title: string = 'Loading...') {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }
  closeAll() {
    Swal.close();
  }
}
