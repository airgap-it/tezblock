import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CopyService {
  copyToClipboard(val: string) {
    // This would be a nicer solution, but it doesn't work in Safari
    // (navigator as any).clipboard.writeText(val)

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
