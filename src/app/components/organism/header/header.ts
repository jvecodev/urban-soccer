import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    standalone: true,
    imports: [Toolbar, AvatarModule, ButtonModule]
})
export class Header {

}
