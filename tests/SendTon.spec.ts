import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { fromNano, toNano } from '@ton/core';
import { SendTon, Withdraw } from '../wrappers/SendTon';
import '@ton/test-utils';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sendTon: SandboxContract<SendTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        await sendTon.send(deployer.getSender(), { value: toNano('500') }, null);
    });

    it('should deploy and receive ton', async () => {
        const balance = await sendTon.getBalance();
    });

    it('should withdraw all', async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();

        await sendTon.send(user.getSender(), { value: toNano('1') }, 'withdraw_all');

        const blanceAfterUser = await user.getBalance();

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(blanceAfterUser);

        const balanceBeforeDeployer = await deployer.getBalance();
        await sendTon.send(deployer.getSender(), { value: toNano('0.1') }, 'withdraw_all');
        const balanceAfterDeployer = await deployer.getBalance();

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer);
    });

    it('should withdraw safe', async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();

        await sendTon.send(user.getSender(), { value: toNano('0.01') }, 'withdraw safe');

        const blanceAfterUser = await user.getBalance();

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(blanceAfterUser);

        const balanceBeforeDeployer = await deployer.getBalance();
        await sendTon.send(deployer.getSender(), { value: toNano('0.01') }, 'withdraw safe');
        const balanceAfterDeployer = await deployer.getBalance();

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer);

        const contractBalance = await sendTon.getBalance();

        expect(contractBalance).toBeGreaterThan(0n);
    });

    it('should withdraw message', async () => {
        const message: Withdraw = {
            $$type: 'Withdraw',
            amount: toNano('150'),
        };

        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance();
        await sendTon.send(
            user.getSender(),
            {
                value: toNano('0.2'),
            },
            message,
        );
        const balanceAfterUser = await user.getBalance();
        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser);

        const balanceBeforeDeployer = await deployer.getBalance();
        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message,
        );

        const balanceAfterDeployer = await deployer.getBalance();
        expect(balanceBeforeDeployer + toNano("150")).toBeGreaterThanOrEqual(balanceAfterDeployer);

        const contractBalance = await sendTon.getBalance();
        expect(contractBalance).toBeGreaterThan(0n);
    });
});
