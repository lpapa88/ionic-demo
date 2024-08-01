import { ENVIRONMENT_SERVICE, IONIC_ENV_SERVICE } from '@aaa-mobile/shared/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { IonicEnvironment } from 'src/environments/ionic-env';
import { EventService } from '../core/event.service';
import { HomePage } from './home.page';
import { IonicStorageModule } from '@ionic/storage';
import { NgxsModule, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { RouteHomeConfigService } from '../core/route-home-config.service';

class MockPlatform {
	resume: jasmine.Spy<any>;
}

describe('HomePage', () => {
	let component: HomePage;

	let mockEventService: any,
		mockRouter: any,
		mockStore: Store,
		mockPlatform: any,
		mockCommonService: any,
		mockEnvironmentService: any,
		mockRouteHomeConfigService: any,
		mockTranslateService: any,
		mockMenuController: any,
		mockInboxService: any;

	let mockElementRef: any;
	const elementRef = {
		nativeElement: {
			mockElement: '<div></div>',
		},
	};

	beforeEach(async () => {
		mockElementRef = jasmine.createSpyObj([''], {
			nativeElement: elementRef.nativeElement.mockElement,
		});

		mockCommonService = jasmine.createSpyObj(['checkInternetConnectivity', 'addMwgQueryParams', 'createLinkFor']);

		mockEventService = jasmine.createSpyObj(['publish']);
		mockStore = jasmine.createSpyObj(['selectSnapshot']);

		mockPlatform = new MockPlatform();
		const platformResumeSpy = jasmine.createSpyObj(mockPlatform.resume, ['subscribe']);
		mockPlatform.resume = platformResumeSpy;

		mockRouteHomeConfigService = jasmine.createSpyObj(['homeIsLoaded']);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes([]), IonicStorageModule.forRoot(), NgxsModule.forRoot()],
			providers: [
				{ provide: Router, useValue: mockRouter },
				{ provide: EventService, useValue: mockEventService },
				{ provide: ENVIRONMENT_SERVICE, useValue: environment },
				{ provide: IONIC_ENV_SERVICE, useValue: IonicEnvironment },
				{ provide: Platform, useValue: mockPlatform },
				{ privide: RouteHomeConfigService, useValue: mockRouteHomeConfigService },
			],
		});
		mockRouter = TestBed.inject(Router);
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockStore = TestBed.inject(Store);

		mockInboxService = jasmine.createSpyObj(['']);

		component = new HomePage(
			mockEventService,
			mockRouter,
			mockPlatform,
			mockCommonService,
			mockRouteHomeConfigService,
			mockEnvironmentService,
			mockStore
		);
	});

	it('should create inline drawer passing respective component', () => {
		//@ts-ignore
		component.inlineDrawerGroupId = 'id';
		//@ts-ignore
		component.renderDrawerView('no-member-no-insurance');
	});

	it('should create inline drawer for guest user', () => {
		//@ts-ignore
		component.inlineDrawerGroupId = 'id';
		//@ts-ignore
		component.renderDrawerView('no-member-no-insurance');
	});

	it('should prepare view for logged in user with both membership and insurance', fakeAsync(() => {
		//@ts-ignore
		spyOn(component, 'renderDrawerView');

		mockStore.reset({
			...mockStore.snapshot(),
			auth: {
				user: {
					membershipId: 10,
				},
				membershipCardData: {
					name: 'User',
				},
				oauth: {
					igData: {
						accessToken: 'token',
					},
				},
			},
		});

		tick(1000);
		//@ts-ignore
		expect(component.renderDrawerView).toHaveBeenCalledWith('member-with-insurance');
	}));

	it('should prepare view for logged in user with only membership and no insurance', fakeAsync(() => {
		//@ts-ignore
		spyOn(component, 'renderDrawerView');
		mockStore.reset({
			...mockStore.snapshot(),
			auth: {
				user: {
					membershipId: 10,
				},
				membershipCardData: {
					name: 'User',
				},
				oauth: {
					igData: null,
				},
			},
		});

		tick(1000);
		//@ts-ignore
		expect(component.renderDrawerView).toHaveBeenCalledWith('member-no-insurance');
	}));

	it('should prepare view for logged in user with no membership and no insurance', fakeAsync(() => {
		//@ts-ignore
		spyOn(component, 'renderDrawerView');
		mockStore.reset({
			...mockStore.snapshot(),
			auth: {
				user: {},
				membershipCardData: null,
				oauth: {
					igData: null,
				},
			},
		});

		tick(1000);
		//@ts-ignore
		expect(component.renderDrawerView).toHaveBeenCalledWith('no-member-no-insurance');
	}));

	it('should NOT open a manage membership page on click of user icon when internet is not connected', () => {
		mockCommonService.checkInternetConnectivity.and.returnValue(false);
		component.onMembershipCardClick();
		expect(mockRouter.navigate).not.toHaveBeenCalled();
	});

	it('should open account dashboard on click of user icon when the internet is connected', () => {
		mockCommonService.checkInternetConnectivity.and.returnValue(true);
		component.onMembershipCardClick();
		expect(mockRouter.navigate).toHaveBeenCalled();
	});

	it('should call homeIsLoaded at routeHomeConfigService when home view did enter', () => {
		component.ionViewDidEnter();
		expect(mockRouteHomeConfigService.homeIsLoaded).toHaveBeenCalled();
	});
});
