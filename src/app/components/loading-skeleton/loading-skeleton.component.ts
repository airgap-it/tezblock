import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss'],
})
export class LoadingSkeletonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  @Input()
  public class: string = 'p';

  @Input()
  public loadingWidth = '100%';
}
