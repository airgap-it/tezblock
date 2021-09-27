// https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular

import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface Context<T> {
  appVar: T;
}

@Directive({
  selector: '[appVar]',
})
export class VarDirective<T = unknown> {
  // https://angular.io/guide/structural-directives#typing-the-directives-context
  static ngTemplateContextGuard<T>(
    dir: VarDirective<T>,
    ctx: any
  ): ctx is Context<T> {
    return true;
  }

  private context?: Context<T>;

  constructor(
    private vcRef: ViewContainerRef,
    private templateRef: TemplateRef<Context<T>>
  ) {}

  @Input()
  set appVar(value: T) {
    if (this.context) {
      this.context.appVar = value;
    } else {
      this.context = { appVar: value };
      this.vcRef.createEmbeddedView(this.templateRef, this.context);
    }
  }
}
