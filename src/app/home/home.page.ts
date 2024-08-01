import { Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { EnvironmentService } from '@aaa-mobile/shared/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe, Location } from '@angular/common';
import { capitalize } from 'lodash';
import { LocalNotifications } from '@capacitor/local-notifications';
import { InboxService, InboxMessage } from '@aaa-mobile/features/inbox';
import { RoutesProvider } from 'src/app/routes.provider';
import { AuthProviderState, IMembership, IMembershipFlags, IMembershipPlan, IUserInfo, IUserProperties } from '../auth';
import { EventService } from '../core/event.service';
import { EVENT_TAGS, EVENTS } from '../core/events';
import { CommonService } from '../shared/services/common.service';
import { RouteHomeConfigService } from '../core/route-home-config.service';
import { ModalService } from '../components/modal/modal.service';
import { ValidatePageNavigationService } from 'src/app/shared/services/validate-page-navigation.service';
import { WalletService } from '../components/mwg-membership-card/cards/wallet/service/wallet.service';
import { SetShowWalletTileAtHomePage } from '../shared/states/user-personalization.actions';
import { MwgLoadingScreenService } from '../shared/services/mwg-loading-screen.service';
import { UserLocationService } from '../shared/services/user-location.service';
import { NotificationService } from '../shared/services/notification.service';

interface IHomeTiles {
	icon?: string;
	title: string;
	subtitle?: string;
	className?: string;
	click(): any;
	show?: boolean;
}

interface IHomeCard {
	icon: string;
	title: string;
	subtitle: string;
	className: string;
	click(): any;
	show?: boolean;
}

export let tempThis: any;

const STATES_WITH_AUTO_REPAIR_SERVICES = ['CA', 'AZ', 'NV'];

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
	@Select(AuthProviderState.getUser) public user$?: Observable<IUserInfo>;
	@Select(AuthProviderState.getMembership) public membership$?: Observable<IMembership>;
	@Select(AuthProviderState.getMembershipPlan) public membershipPlan$?: Observable<IMembershipPlan>;
	@Select(AuthProviderState.getMembershipFlags) public membershipFlags$?: Observable<IMembershipFlags>;
	@Select(AuthProviderState.getUserProperties) public userAuthenticationProperties$?: Observable<IUserProperties>;

	public loadingExperience: boolean = true;
	public nonAuthenticatedUser: boolean = true;
	public isIPadOrTablet: boolean = false;
	public notificationCounter: number = 0;
	public notificationsAllowed: boolean = false;
	public isRenewMembershipVisible: boolean = false;
	public shouldShowWalletTile: boolean = false;
	public walletActionText: string = '';

	private userProperties?: IUserProperties = undefined;
	private messagesSubscription$: Subscription | undefined;
	private platformSubscription$: Subscription | undefined;
	private walletSubscription$: Subscription | undefined;

	public homeTiles: IHomeTiles[] = [
		{
			title: '',
			subtitle: '',
			className: 'renew-membership',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_RENEW_TILE);
				this.openLink(this.environmentService.club.renewMembership, this.refreshMembershipInformation);
			},
		},
		{
			icon: 'cheapest-gas-nearby',
			className: 'cheapest-gas-nearby',
			title: 'MWG.PAGES.HOME.TILES.CHEAPEST_GAS',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_CHEAPEST_GAS);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.GAS)]);
			},
		},
		{
			icon: 'electric-vehicles',
			className: 'electric-vehicles',
			title: 'MWG.PAGES.HOME.TILES.ELECTRIC_VEHICLES',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_ELECTRIC_VEHICLES);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.ELECTRICVEHICLES)]);
			},
		},
		{
			icon: 'my-vehicles',
			title: 'MWG.PAGES.HOME.TILES.MY_VEHICLES',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MY_VEHICLES);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.ROADSIDE)]);
			},
		},
		{
			icon: 'auto-repair',
			className: 'auto-repair',
			title: 'MWG.PAGES.HOME.TILES.AUTO_REPAIR',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_AUTO_REPAIR);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.AUTOREPAIR)]);
			},
			show: false,
		},
		{
			icon: 'find-a-branch',
			className: 'find-a-branch',
			title: 'MWG.PAGES.HOME.TILES.FIND_A_BRANCH',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_FIND_A_BRANCH);
				this.openLink(this.environmentService.club.branchesUrl);
			},
		},
		{
			icon: 'discounts',
			className: 'discounts',
			title: 'MWG.PAGES.HOME.TILES.DISCOUNTS',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_DISCOUNTS);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.DISCOUNTS)], {
					state: { redirect: this.router.url },
				});
			},
		},
		{
			icon: 'smart-home-security',
			className: 'smart-home-security',
			title: 'MWG.PAGES.HOME.TILES.SMART_HOME_SECURITY',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_SMART_HOME_SECURITY);

				const params = [
					{ key: 'utm_source', value: 'AAA-Digital' },
					{ key: 'utm_medium', value: 'AAA' },
					{ key: 'utm_campaign', value: 'AAA-App' },
					{ key: 'utm_campaign_content', value: 'ID_773' },
				];

				this.openLink(this.environmentService.club.smartHomeSecurity, undefined, params);
			},
		},
	];

	public homeCards: IHomeCard[] = [
		{
			icon: 'aaa',
			title: 'MWG.PAGES.HOME.TILES.JOIN_AAA.TITLE',
			subtitle: 'MWG.PAGES.HOME.TILES.JOIN_AAA.SUBTITLE',
			className: 'mwg-home-card-left',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_JOIN_AAA_TILE);
				this.onMembershipCardClick();
			},
		},
		{
			icon: 'insurance-home',
			title: 'MWG.PAGES.HOME.TILES.ADD_INSURANCE.TITLE',
			subtitle: 'MWG.PAGES.HOME.TILES.ADD_INSURANCE.SUBTITLE',
			className: 'mwg-home-card-right',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_ADD_INSURANCE_TITLE);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.INSURANCE)]);
			},
		},
		{
			icon: 'aaa',
			title: 'MWG.PAGES.HOME.TILES.ADD_JOIN_MEMBERSHIP.TITLE',
			subtitle: 'MWG.PAGES.HOME.TILES.ADD_JOIN_MEMBERSHIP.SUBTITLE',
			className: 'mwg-home-card-left',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MEMBERSHIP_ADD_OR_JOIN_TILE);
				this.onMembershipCardClick();
			},
		},
		{
			icon: 'aaa',
			title: 'MWG.PAGES.HOME.TILES.MEMBERSHIP.TITLE',
			subtitle: 'MWG.PAGES.HOME.TILES.MEMBERSHIP.SUBTITLE',
			className: 'mwg-home-card-left',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MEMBERSHIP_TILE);
				this.onMembershipCardClick();
			},
		},
		{
			icon: 'insurance-home',
			title: 'MWG.PAGES.HOME.TILES.INSURANCE.TITLE',
			subtitle: 'MWG.PAGES.HOME.TILES.INSURANCE.SUBTITLE',
			className: 'mwg-home-card-right',
			click: () => {
				this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_INSURANCE_TILE);
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.INSURANCE)]);
			},
		},
	];

	private notification: any = null;
	private shouldSeeAutoRepair: boolean = false;

	constructor(
		private events: EventService,
		private router: Router,
		private platform: Platform,
		private commonService: CommonService,
		private routeHomeConfigService: RouteHomeConfigService,
		private environmentService: EnvironmentService,
		private store: Store,
		private translateService: TranslateService,
		private menuController: MenuController,
		private inboxService: InboxService,
		private modalService: ModalService,
		private activatedRoute: ActivatedRoute,
		private validatePageNavigation: ValidatePageNavigationService,
		private location: Location,
		private walletService: WalletService,
		private mwgLoadingScreenService: MwgLoadingScreenService,
		private userLocationService: UserLocationService,
		private notificationService: NotificationService
	) {
		this.platform.ready().then(() => {
			this.checkNotificationsPermissions();
		});

		this.platformSubscription$ = this.platform.resume.subscribe(() => {
			this.checkNotificationsPermissions();
		});

		const autoRepairAvailableSubscription$ = this.userLocationService.isServiceAvailableFor(
			STATES_WITH_AUTO_REPAIR_SERVICES
		);

		if (this.userAuthenticationProperties$) {
			combineLatest([autoRepairAvailableSubscription$, this.userAuthenticationProperties$]).subscribe(
				(values) => {
					const [isAutoRepairAvailable, properties] = values;
					this.shouldSeeAutoRepair = isAutoRepairAvailable;

					this.userProperties = properties;
					this.loadingExperience = !properties;
					this.nonAuthenticatedUser = !properties?.isAuthenticated;
					this.updateHomeCardsAndTilesVisibility();
				}
			);
		}

		this.activatedRoute.queryParams.subscribe((queryParams) => {
			this.notification = (this.location.getState() as any)?.notification || null;
			if (this.notification) {
				this.checkPushNotification();
			}
		});

		this.messagesSubscription$ = this.inboxService.getAllMessages().subscribe((messages: Array<InboxMessage>) => {
			this.notificationCounter = messages?.filter((item: InboxMessage) => !item?.readAt)?.length || 0;
		});

		this.walletSubscription$ = this.walletService.shouldShowTileInHomePage().subscribe(async (shouldShow) => {
			this.shouldShowWalletTile = shouldShow && !this.isIPadOrTablet;
			this.walletActionText = await this.walletService.actionTextOnHomePageTile();
		});
	}

	ngAfterViewInit() {
		tempThis = this;
	}

	ionViewDidEnter() {
		this.isIPadOrTablet = this.commonService.isIPadOrTablet();
		this.routeHomeConfigService.homeIsLoaded();
	}

	ngOnDestroy() {
		this.platformSubscription$?.unsubscribe();
		this.messagesSubscription$?.unsubscribe();
		this.walletSubscription$?.unsubscribe();
	}

	public openMenu() {
		this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MY_ACCOUNT_PROFILE_ICON);
		this.menuController.open();
	}

	private membershipExpDate(): string {
		const membership = this.store.selectSnapshot(AuthProviderState.getMembership);
		if (!membership || !membership.expDate) return '';

		const parts = membership.expDate.split('');
		const year = parts.splice(0, 4).join('');
		const month = parts.splice(0, 2).join('');
		const day = parts.join('');

		const datePipe = new DatePipe('en-US');
		const formattedMonth = datePipe.transform(new Date(+year, +month - 1, +day), 'MMM') || '';
		const monthStr = capitalize(formattedMonth);
		return monthStr + '. ' + day + ', ' + year;
	}

	private async updateHomeCardsAndTilesVisibility() {
		const membershipFlags = this.store.selectSnapshot(AuthProviderState.getMembershipFlags);

		this.homeTiles = this.homeTiles.map((tile) => {
			if (tile.className === 'renew-membership') {
				const { renewTitle, renewSubtitle } = this.getRenewalTitleAndSubtitle(membershipFlags);

				const showTile: boolean =
					membershipFlags !== undefined &&
					membershipFlags?.membershipState !== undefined &&
					membershipFlags?.membershipState !== 'active';

				this.isRenewMembershipVisible = showTile;

				return {
					...tile,
					title: renewTitle,
					subtitle: renewSubtitle,
					show: showTile,
				};
			} else if (tile.title === 'MWG.PAGES.HOME.TILES.MY_VEHICLES') {
				return { ...tile, show: this.validatePageNavigation.canNavigateTo('roadside') };
			} else if (tile.title === 'MWG.PAGES.HOME.TILES.AUTO_REPAIR') {
				return { ...tile, show: this.shouldSeeAutoRepair };
			} else {
				return { ...tile, show: true };
			}
		});

		const hasMembership = this.userProperties?.hasMembership ?? false;

		this.homeCards = this.homeCards.map((card) => {
			if (
				card.title === 'MWG.PAGES.HOME.TILES.JOIN_AAA.TITLE' ||
				card.title === 'MWG.PAGES.HOME.TILES.ADD_INSURANCE.TITLE'
			) {
				return { ...card, show: this.nonAuthenticatedUser };
			} else if (card.title === 'MWG.PAGES.HOME.TILES.MEMBERSHIP.TITLE') {
				return { ...card, show: !this.nonAuthenticatedUser && hasMembership };
			} else if (card.title === 'MWG.PAGES.HOME.TILES.ADD_JOIN_MEMBERSHIP.TITLE') {
				return { ...card, show: !this.nonAuthenticatedUser && !hasMembership };
			} else if (card.title === 'MWG.PAGES.HOME.TILES.INSURANCE.TITLE') {
				return { ...card, show: !this.nonAuthenticatedUser };
			} else {
				return { ...card, show: false };
			}
		});
	}

	private getRenewalTitleAndSubtitle(membershipFlags: IMembershipFlags | undefined) {
		if (!membershipFlags) return { renewTitle: '', renewSubtitle: '' };

		const daysUntilExpiration = membershipFlags.daysUntilExpiration;

		const isExpired = membershipFlags.isExpired;
		const isAtRenewState = membershipFlags.membershipState === 'renew';

		const renewTitle = isAtRenewState
			? this.translateService.instant('MWG.PAGES.HOME.TILES.RENEW_MEMBERSHIP.RENEWAL_TILE_TITLE')
			: this.translateService.instant('MWG.PAGES.HOME.TILES.RENEW_MEMBERSHIP.RENEWAL_TILE_EXPIRED_TITLE');

		const renewSubtitle = isExpired
			? this.translateService.instant('MWG.PAGES.HOME.TILES.RENEW_MEMBERSHIP.RENEWAL_TILE_DESCRIPTION_EXPIRED', {
					date: this.membershipExpDate(),
			  })
			: daysUntilExpiration === 1
			? this.translateService.instant(
					'MWG.PAGES.HOME.TILES.RENEW_MEMBERSHIP.RENEWAL_TILE_DESCRIPTION_RENEW_TODAY'
			  )
			: this.translateService.instant('MWG.PAGES.HOME.TILES.RENEW_MEMBERSHIP.RENEWAL_TILE_DESCRIPTION_RENEW', {
					days: daysUntilExpiration,
			  });

		return { renewTitle, renewSubtitle };
	}

	private openLink(link: string, onWebViewCloseAction?: () => any, params?: any) {
		if (this.commonService.checkInternetConnectivity(true)) {
			this.commonService.refreshTokenAndOpenWebLink(
				link,
				this.environmentService.club.aaaDomain,
				onWebViewCloseAction,
				params
			);
		}
	}

	public signIn() {
		this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_SIGN_IN);
		this.router.navigate(['/newUser']);
	}

	public onMembershipCardClick() {
		if (this.commonService.checkInternetConnectivity(true)) {
			const isNonMemberGuestUser = this.store.selectSnapshot(AuthProviderState.isNonMemberGuestUser);
			if (this.nonAuthenticatedUser) this.commonService.joinAAA();
			else if (isNonMemberGuestUser) this.showLinkYourMembershipModal();
			else this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.MEMBERSHIPDASHBOARD)]);
		}
	}

	private showLinkYourMembershipModal() {
		const linkAction: () => Promise<void> = async () => {
			this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MEMBERSHIP_ADD_OR_JOIN_MODAL_LINK_YOUR_MEMBERSHIP);
			await this.commonService.attachMembershipToUser(EVENT_TAGS.HOMEPAGE_LINK_MEMBERSHIP_ERROR);
			this.router.onSameUrlNavigation = 'reload';
			this.modalService.closeModal();
		};

		const joinAction: () => Promise<void> = async () => {
			this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_MEMBERSHIP_ADD_OR_JOIN_MODAL_CONTINUE_WITH_JOINING);
			this.commonService.refreshTokenAndOpenWebLink(
				this.environmentService.club.membershipJoinUrl,
				this.environmentService.club.aaaDomain,
				this.refreshMembershipInformation
			);
			this.modalService.closeModal();
		};

		this.openRequiredMembershipModalWith(
			'MWG.PAGES.HOME.TILES.JOIN_AAA.MODAL.MEMBERSHIP_MODAL_TITLE',
			'MWG.PAGES.HOME.TILES.JOIN_AAA.MODAL.MEMBERSHIP_MODAL_DESCRIPTION_TITLE',
			'MWG.PAGES.HOME.TILES.JOIN_AAA.MODAL.MEMBERSHIP_MODAL_DESCRIPTION',
			linkAction,
			'MWG.PAGES.HOME.TILES.JOIN_AAA.MODAL.MEMBERSHIP_MODAL_NO_MEMBERSHIP_MODAL_ACTION',
			joinAction,
			'MWG.PAGES.HOME.TILES.JOIN_AAA.MODAL.MEMBERSHIP_MODAL_CONTINUE_JOINING'
		);
	}

	private refreshMembershipInformation() {
		if (this) this.commonService.refreshMembershipInformation();
		else tempThis.commonService.refreshMembershipInformation();
	}

	private openRequiredMembershipModalWith(
		title: string,
		descriptionTitle: string,
		description: string,
		action: () => void,
		actionText: string,
		secondaryAction: () => void,
		secondaryActionText: string
	) {
		this.modalService.openModal({
			title: this.translateService.instant(title),
			normalTitle: true,
			descriptionTitle: this.translateService.instant(descriptionTitle),
			description: this.translateService.instant(description),
			primaryAction: action,
			primaryActionText: this.translateService.instant(actionText),
			secondaryAction: secondaryAction,
			secondaryActionText: this.translateService.instant(secondaryActionText),
		});
	}

	public goToNotifications() {
		this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_NOTIFICATION_ICON);
		this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.NOTIFICATIONS)]);
	}

	private async checkNotificationsPermissions() {
		const permStatus = await LocalNotifications.checkPermissions();
		this.notificationsAllowed = permStatus?.display === 'granted';
	}

	private checkPushNotification() {
		switch (this.notification?.pushAction) {
			case 'membership':
				this.onMembershipCardClick();
				break;
			case 'insurance':
				this.router.navigate([RoutesProvider.getUrl(RoutesProvider.APP_SECTIONS.INSURANCE)]);
				break;
			// Another product will replace this
			// case 'identity_champion':
			// 	this.onIdentityChampionClick();
			// 	break;
			default:
				break;
		}

		this.notificationService.markNotificationAsRead(this.notification);
		this.notification = null;
	}

	public addOrUpdateWalletCard() {
		this.walletService.sendAnalyticsEventForHomePageClick();

		this.mwgLoadingScreenService.showLoaderModal('ADD_UPDATE_WALLET_HOME', 'COMMON.ACTIONS.LOADING_WALLET_CARD');
		this.walletService.addToWallet().subscribe({
			next: () => this.mwgLoadingScreenService.closeLoaderModal('ADD_UPDATE_WALLET_HOME'),
			error: () => {
				this.mwgLoadingScreenService.closeLoaderModal('ADD_UPDATE_WALLET_HOME');
				this.walletService.genericErrorAlert();
			},
		});
	}

	public dismissWalletCardTile() {
		this.events.publish(EVENTS.CLICK, EVENT_TAGS.HOMEPAGE_WALLET_TILE_CLOSE);
		this.store.dispatch(new SetShowWalletTileAtHomePage(false));
	}
}
